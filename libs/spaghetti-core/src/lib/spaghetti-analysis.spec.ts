import { analyzeFile } from './spaghetti-analysis';

describe('spaghetti analysis', () => {
  it('detects every V1 command kind without traversing into nested functions', () => {
    const result = analyzeFile(`
let distant = 0;
const obj = { x: 0 };
function work(local: number) {
  api();
  local = 1;
  local++;
  --local;
  obj.x = local;
  delete obj.x;
  function nested() { distant++; }
}`);
    expect(result.functions.find(fn => fn.name === 'work')?.commands.map(c => c.kind)).toEqual([
      'discarded-call', 'assignment', 'increment', 'decrement', 'property-assignment', 'delete',
    ]);
    expect(result.functions.find(fn => fn.name === 'nested')?.commands).toHaveLength(1);
  });

  it('tracks declaration, line and scope distance and configurable scores', () => {
    const [command] = analyzeFile(
      `let shared = 0;\nfunction update() {\n  shared++;\n}`,
      'sample.ts',
      { scoring: { baseScores: { increment: 10 }, lineDistanceWeight: 2, scopeDistanceWeight: 5 } },
    ).commands;
    expect(command.declaration?.name).toBe('shared');
    expect(command.distance).toMatchObject({ line: 2, scope: 1 });
    expect(command.remote).toBe(true);
    expect(command.score).toBe(19);
  });

  it('treats parameters and block locals as nearby resources', () => {
    const commands = analyzeFile(`function local(value: number) {
      value = 2;
      { let inside = 0; inside++; }
    }`).commands;
    expect(commands.every(command => !command.remote)).toBe(true);
  });
});
