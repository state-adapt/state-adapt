import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { analyzeFile, analyzeProject } from './spaghetti-analysis';

describe('function effect boundaries', () => {
  it('does not propagate the Fidelity sortBooks local-allocation commands', () => {
    const result = analyzeFile(
      `declare function computed<T>(factory: () => T): T;
type BookSortOrder = 'asc' | 'desc';
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
}
class BooksPage {
  booksList = { sortOrder: () => 'asc' as BookSortOrder, sortProp: () => 'name' as BookSortProp };
  booksAll = () => [] as BookModel[];
  booksSorted = computed(() =>
    sortBooks(
      this.booksList.sortOrder(),
      this.booksList.sortProp(),
      this.booksAll()
    )
  );
}`,
      'books-page.ts',
    );
    const sortBooks = result.functions.find(fn => fn.name === 'sortBooks');
    const computedFactories = result.functions.filter(fn => fn.name === '<anonymous>');
    const computedFactory = computedFactories[computedFactories.length - 1];

    expect(sortBooks?.commands).toHaveLength(2);
    expect(sortBooks?.commands.every(command => command.api === 'Array.sort')).toBe(true);
    expect(computedFactory).toMatchObject({ commands: [], score: 0 });
  });

  it('applies local-allocation boundaries across files', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-effects-'));
    try {
      fs.writeFileSync(
        path.join(root, 'sort.ts'),
        `export function sortBooks(books: number[]) {
  return [...books].sort();
}`,
      );
      fs.writeFileSync(
        path.join(root, 'page.ts'),
        `import { sortBooks } from './sort';
declare function computed<T>(factory: () => T): T;
const books: number[] = [];
const booksSorted = computed(() => sortBooks(books));`,
      );
      const project = analyzeProject(root);
      const callerFile = project.files.find(file => file.filePath.endsWith('page.ts'));
      const computedFactory = callerFile?.functions.find(fn => fn.name === '<anonymous>');

      expect(computedFactory).toMatchObject({ commands: [], score: 0 });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('propagates parameter mutations and rebinds them to caller arguments', () => {
    const result = analyzeFile(`function sortInPlace(values: number[]) {
  return values.sort();
}
function caller(input: number[]) {
  return sortInPlace(input);
}`);
    const command = result.functions.find(fn => fn.name === 'caller')?.commands[0];

    expect(command).toMatchObject({
      api: 'Array.sort',
      resource: 'input',
      declaration: { name: 'input', kind: 'parameter' },
      resourceProvenance: {
        confidence: 'proven',
        origins: [{ kind: 'declaration', parameterIndex: 0 }],
      },
      callPath: [{ callee: 'source.ts:sortInPlace@1' }],
    });
  });

  it('keeps module, class, closure, and proven-external effects exported', () => {
    const result = analyzeFile(`declare const external: number[];
const moduleValues: number[] = [];
class Holder {
  values: number[] = [];
  mutateClass() { this.values.sort(); }
}
function mutateModule() { moduleValues.sort(); }
function mutateExternal() { external.sort(); }
function outer() {
  const captured: number[] = [];
  function mutateClosure() { captured.sort(); }
  mutateClosure();
}
function classCaller(holder: Holder) { holder.mutateClass(); }
function moduleCaller() { mutateModule(); }
function externalCaller() { mutateExternal(); }`);

    expect(result.functions.find(fn => fn.name === 'outer')?.commands).toHaveLength(1);
    expect(result.functions.find(fn => fn.name === 'classCaller')?.commands).toHaveLength(
      1,
    );
    expect(
      result.functions.find(fn => fn.name === 'moduleCaller')?.commands,
    ).toHaveLength(1);
    expect(
      result.functions.find(fn => fn.name === 'externalCaller')?.commands[0],
    ).toMatchObject({ external: true });
  });

  it('keeps local allocation commands in their owner but not its callers', () => {
    const result = analyzeFile(`function makeSorted(input: number[]) {
  const copy = [...input];
  copy.sort();
  return copy;
}
function caller(input: number[]) { return makeSorted(input); }`);

    expect(result.functions.find(fn => fn.name === 'makeSorted')?.commands).toHaveLength(
      1,
    );
    expect(result.functions.find(fn => fn.name === 'caller')).toMatchObject({
      commands: [],
      score: 0,
    });
  });

  it('stops parameter effects after rebinding to a caller-owned allocation', () => {
    const result = analyzeFile(`function leaf(values: number[]) { values.sort(); }
function middle(input: number[]) {
  const copy = [...input];
  leaf(copy);
}
function root(input: number[]) { middle(input); }`);

    const middle = result.functions.find(fn => fn.name === 'middle');
    expect(middle?.commands).toMatchObject([
      {
        resource: 'copy',
        resourceProvenance: { origins: [{ kind: 'allocation' }] },
        callPath: [{ callee: 'source.ts:leaf@1' }],
      },
    ]);
    expect(result.functions.find(fn => fn.name === 'root')?.commands).toEqual([]);
  });

  it('rebinds parameter effects through aliases and multiple call hops', () => {
    const result = analyzeFile(`function leaf(values: number[]) { values.sort(); }
function middle(values: number[]) {
  const alias = values;
  leaf(alias);
}
function root(input: number[]) { middle(input); }`);
    const command = result.functions.find(fn => fn.name === 'root')?.commands[0];

    expect(command).toMatchObject({
      resource: 'input',
      declaration: { name: 'input', kind: 'parameter' },
      resourceProvenance: {
        confidence: 'proven',
        origins: [{ kind: 'declaration', parameterIndex: 0 }],
      },
    });
    expect(command?.callPath.map(hop => hop.callee)).toEqual([
      'source.ts:middle@2',
      'source.ts:leaf@1',
    ]);
  });

  it('propagates unknown origins conservatively without making them external', () => {
    const result = analyzeFile(`declare function getValues(): number[];
function mutate(values: number[]) { values.sort(); }
function caller() { mutate(getValues()); }
function root() { caller(); }`);
    const caller = result.functions.find(fn => fn.name === 'caller')?.commands[0];
    const root = result.functions.find(fn => fn.name === 'root')?.commands[0];

    expect(caller?.resourceProvenance).toEqual({
      confidence: 'unknown',
      origins: [{ kind: 'unknown' }],
    });
    expect(caller?.external).toBeUndefined();
    expect(root?.resourceProvenance).toEqual(caller?.resourceProvenance);
    expect(root?.external).toBeUndefined();
  });

  it('treats allocation defaults and rest arrays as callee-owned values', () => {
    const result = analyzeFile(`function mutateDefault(values: number[] = []) {
  values.sort();
}
function mutateRest(...values: number[]) {
  values.sort();
}
function caller() {
  mutateDefault();
  mutateRest(2, 1);
}`);

    expect(result.functions.find(fn => fn.name === 'caller')).toMatchObject({
      commands: [],
      score: 0,
    });
  });

  it('recalculates external evidence after parameter rebinding', () => {
    const command = analyzeFile(`declare const shared: number[];
function mutate(values: number[]) { values.sort(); }
function caller() { mutate(shared); }`).functions.find(fn => fn.name === 'caller')
      ?.commands[0];

    expect(command).toMatchObject({
      resource: 'shared',
      external: true,
      scoreBreakdown: { external: 100 },
      resourceProvenance: {
        confidence: 'proven',
        origins: [{ kind: 'external', declaration: { name: 'shared' } }],
      },
    });
  });
});
