import { analyzeFile } from './spaghetti-analysis';

const lintScoring = {
  baseScores: {
    'discarded-call': 0 as const,
    assignment: 0 as const,
    'property-assignment': 0 as const,
    increment: 0 as const,
    decrement: 0 as const,
    delete: 0 as const,
    'api-command': 0 as const,
  },
  declarationLineDistanceWeight: 1,
  scopeCrossingWeight: 1,
  fileCrossingWeight: 30,
  folderCrossingWeight: 15,
  externalPenalty: 100,
};

describe('resource value provenance', () => {
  it('treats inline array allocations as zero-distance internal values', () => {
    const result = analyzeFile(
      `type BookSortOrder = 'asc' | 'desc';
type BookSortProp = 'name' | 'earnings';
interface BookModel { name: string; earnings: string; }
export function sortBooks(
  order: BookSortOrder,
  prop: BookSortProp,
  books: BookModel[]
): BookModel[] {
  const direction = order === 'asc' ? 1 : -1;
  if (prop === 'name') {
    return [...books].sort((a, b) => direction * a.name.localeCompare(b.name));
  }
  return [...books].sort((a, b) => {
    return direction * (parseFloat(a.earnings) - parseFloat(b.earnings));
  });
}`,
      'books.ts',
      { scoring: lintScoring },
    );
    const commands = result.functions.find(fn => fn.name === 'sortBooks')?.commands;

    expect(commands).toHaveLength(2);
    expect(commands?.map(command => command.score)).toEqual([0, 0]);
    expect(commands?.every(command => command.external === undefined)).toBe(true);
    expect(commands?.map(command => command.resourceProvenance)).toMatchObject([
      { confidence: 'proven', origins: [{ kind: 'allocation' }] },
      { confidence: 'proven', origins: [{ kind: 'allocation' }] },
    ]);
  });

  it('traces local aliases to their allocation definitions', () => {
    const command = analyzeFile(
      `function sortCopy(input: number[]) {
  const copy = [...input];
  return copy.sort();
}`,
      'alias.ts',
      { scoring: lintScoring },
    ).commands[0];

    expect(command).toMatchObject({
      resource: 'copy',
      distance: { declarationLine: 1, scope: 0 },
      declaration: { name: 'copy', kind: 'variable' },
      resourceProvenance: {
        confidence: 'proven',
        origins: [{ kind: 'allocation', location: { start: { line: 2 } } }],
      },
    });
    expect(command.external).toBeUndefined();
  });

  it('does not launder an external value through a local alias', () => {
    const command = analyzeFile(
      `declare const sharedBooks: number[];
function run() {
  const local = sharedBooks;
  local.sort();
}`,
      'external-alias.ts',
      { scoring: lintScoring },
    ).commands[0];

    expect(command).toMatchObject({
      resource: 'local',
      external: true,
      scoreBreakdown: { external: 100 },
      resourceProvenance: {
        confidence: 'proven',
        origins: [{ kind: 'external', declaration: { name: 'sharedBooks' } }],
      },
    });
  });

  it('resolves shadowed globals to their local parameters', () => {
    const command = analyzeFile(
      `function run(window: number[]) {
  window.sort();
}`,
      'shadow.ts',
      { scoring: lintScoring },
    ).commands[0];

    expect(command.external).toBeUndefined();
    expect(command.resourceProvenance).toMatchObject({
      confidence: 'proven',
      origins: [
        {
          kind: 'declaration',
          parameterIndex: 0,
          declaration: { name: 'window', kind: 'parameter' },
        },
      ],
    });
  });

  it('keeps unknown call results unknown instead of calling them external', () => {
    const direct = analyzeFile(
      `declare function getBooks(): number[];
function run() { return getBooks().sort(); }`,
      'unknown-call.ts',
      { scoring: lintScoring },
    ).commands[0];
    const anchored = analyzeFile(
      `declare function getBooks(): number[];
function run() {
  const books = getBooks();
  return books.sort();
}`,
      'anchored-call.ts',
      { scoring: lintScoring },
    ).commands[0];

    expect(direct).toMatchObject({
      score: 0,
      resourceProvenance: { confidence: 'unknown', origins: [{ kind: 'unknown' }] },
    });
    expect(direct.external).toBeUndefined();
    expect(anchored).toMatchObject({
      score: 1,
      declaration: { name: 'books', kind: 'variable' },
      resourceProvenance: {
        confidence: 'unknown',
        origins: [{ kind: 'unknown', declaration: { name: 'books' } }],
      },
    });
    expect(anchored.external).toBeUndefined();
  });

  it('merges conditional origins without converting unknown paths to external', () => {
    const command = analyzeFile(
      `declare function maybeBooks(): number[];
function run(condition: boolean, input: number[]) {
  const books = condition ? [...input] : maybeBooks();
  return books.sort();
}`,
      'branches.ts',
      { scoring: lintScoring },
    ).commands[0];

    expect(command.external).toBeUndefined();
    expect(command.resourceProvenance).toMatchObject({ confidence: 'partial' });
    expect(command.resourceProvenance?.origins.map(origin => origin.kind).sort()).toEqual(
      ['allocation', 'unknown'],
    );
  });

  it('traces project-local return values and parameter-to-argument flow', () => {
    const commands = analyzeFile(
      `declare function consume(value: number[]): number[];
const shared: number[] = [];
function getShared() { return shared; }
function identity<T>(value: T): T { return value; }
function fresh(input: number[]) { return [...input]; }
function run(input: number[]) {
  return [consume(identity(getShared())), consume(fresh(input))];
}`,
      'returns.ts',
      {
        scoring: lintScoring,
        apis: [
          {
            name: 'Test.consume',
            functions: ['consume'],
            resource: 'argument',
          },
        ],
      },
    )
      .functions.find(fn => fn.name === 'run')
      ?.commands.filter(command => command.api === 'Test.consume');

    expect(commands).toHaveLength(2);
    expect(commands?.map(command => command.resourceProvenance)).toMatchObject([
      { confidence: 'proven', origins: [{ kind: 'allocation' }] },
      { confidence: 'proven', origins: [{ kind: 'allocation' }] },
    ]);
    expect(commands?.every(command => command.external === undefined)).toBe(true);
    expect(commands?.[0].resourceProvenance?.origins[0].location?.start.line).toBe(2);
    expect(commands?.[1].resourceProvenance?.origins[0].location?.start.line).toBe(5);
  });

  it('terminates recursive provenance traces as unknown', () => {
    const command = analyzeFile(
      `declare function consume(value: number[]): number[];
function recursive(): number[] { return recursive(); }
function run() { return consume(recursive()); }`,
      'recursive.ts',
      {
        scoring: lintScoring,
        apis: [
          {
            name: 'Test.consume',
            functions: ['consume'],
            resource: 'argument',
          },
        ],
      },
    ).commands.find(command => command.api === 'Test.consume');

    expect(command?.external).toBeUndefined();
    expect(command?.resourceProvenance).toMatchObject({
      confidence: 'unknown',
      origins: [{ kind: 'unknown' }],
    });
  });
});
