import { Linter } from 'eslint';
import { configs, rules } from './rules';

describe('typed configuration', () => {
  it('uses parser options supported by the declared parser v7 peer range', () => {
    expect(configs.recommended.parserOptions).toEqual({ project: true });
  });

  it('fails clearly when parser services are missing', () => {
    const linter = new Linter();
    linter.defineRule('spaghetti', rules['max-commands']);
    expect(() =>
      linter.verify('function run() {}', {
        parserOptions: { ecmaVersion: 2022 },
        rules: { spaghetti: 'error' },
      }),
    ).toThrow('requires type-aware parser services');
  });
});
