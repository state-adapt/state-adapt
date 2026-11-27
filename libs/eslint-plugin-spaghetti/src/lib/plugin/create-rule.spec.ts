import { Rule } from 'eslint';
import { analysisForLintFile } from './analysis';
import { createRule } from './create-rule';

jest.mock('./analysis', () => ({
  analysisForLintFile: jest.fn(() => ({ functions: [] })),
}));

describe('rule context compatibility', () => {
  const sourceCode = {} as Rule.RuleContext['sourceCode'];
  const rule = createRule('Test rule', [], jest.fn());
  const program = { type: 'Program', sourceType: 'module' } as const;

  it('uses properties without the methods removed in ESLint 10', () => {
    const context = {
      options: [],
      sourceCode,
      filename: '/project/example.ts',
    } as unknown as Rule.RuleContext;

    rule.create(context)['Program:exit']?.({ ...program, body: [] });

    expect(analysisForLintFile).toHaveBeenLastCalledWith(
      sourceCode,
      '/project/example.ts',
      {},
    );
  });

  it('falls back to the methods provided by early ESLint 8', () => {
    const context = {
      options: [],
      getSourceCode: () => sourceCode,
      getFilename: () => '<input>',
    } as unknown as Rule.RuleContext;

    rule.create(context)['Program:exit']?.({ ...program, body: [] });

    expect(analysisForLintFile).toHaveBeenLastCalledWith(sourceCode, 'source.ts', {});
  });
});
