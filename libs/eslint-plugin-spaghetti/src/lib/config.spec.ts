import { Linter } from 'eslint';
import { ApiDefinition } from '@state-adapt/spaghetti-core';
import { commandPolicy } from './plugin/policy';
import { configs, rules } from './rules';

describe('typed configuration', () => {
  it('uses parser options supported by the declared parser v7 peer range', () => {
    expect(configs.recommended.parserOptions).toEqual({ project: true });
  });

  it('exposes only the current scoring options in its schema', () => {
    const schema = rules['no-spaghetti'].meta?.schema as Array<{
      properties: Record<string, unknown>;
      additionalProperties: boolean;
    }>;
    expect(schema[0].properties).toHaveProperty('maxScore');
    expect(schema[0].properties).toHaveProperty('declarationLineDistanceWeight');
    expect(schema[0].properties).not.toHaveProperty('max');
    expect(schema[0].properties).not.toHaveProperty('maxDistance');
    expect(schema[0].properties).not.toHaveProperty('declarationLineWeight');
    expect(schema[0].properties).not.toHaveProperty('sameFunctionWeight');
    expect(schema[0].properties).not.toHaveProperty('functionCallWeight');
    expect(schema[0].properties['externalPenalty']).toEqual({
      type: 'number',
      minimum: 0,
    });
    expect(
      (schema[0].properties['builtInRecognizers'] as { items: { enum: string[] } }).items
        .enum,
    ).toEqual(['javascript', 'dom', 'framework']);
    expect(schema[0].additionalProperties).toBe(false);
  });

  it('uses the documented default scoring policy', () => {
    const policy = commandPolicy({});
    expect(policy).toEqual({ maxScore: 6 });
  });

  it('requires exclusive method or function API patterns', () => {
    const schema = rules['no-spaghetti'].meta?.schema as Array<{
      properties: Record<string, { items?: { oneOf?: Array<Record<string, unknown>> } }>;
    }>;
    expect(schema[0].properties['apis'].items?.oneOf).toHaveLength(4);

    const valid: ApiDefinition = {
      name: 'cache.write',
      functions: ['writeCache'],
      resource: 'argument',
    };
    const validCallee: ApiDefinition = {
      name: 'app.start',
      functions: ['start'],
      resource: 'callee',
    };
    const validCall: ApiDefinition = {
      name: 'Console.log',
      calls: ['console.log'],
      penalty: 0,
    };
    const validBuiltIn: ApiDefinition = {
      name: 'Angular.bootstrapApplication',
      penalty: 5,
    };
    // @ts-expect-error Function patterns cannot use a method receiver.
    const invalidReceiver: ApiDefinition = {
      name: 'cache.write',
      functions: ['writeCache'],
      resource: 'receiver',
    };
    // @ts-expect-error An API cannot define both methods and functions.
    const invalidMixed: ApiDefinition = {
      name: 'cache.write',
      methods: ['write'],
      functions: ['writeCache'],
    };
    expect([
      valid,
      validCallee,
      validCall,
      validBuiltIn,
      invalidReceiver,
      invalidMixed,
    ]).toHaveLength(6);
  });

  it('rejects the removed split API options', () => {
    const schema = rules['no-spaghetti'].meta?.schema as Array<{
      properties: Record<string, unknown>;
    }>;
    expect(schema[0].properties).not.toHaveProperty('apiPatterns');
    expect(schema[0].properties).not.toHaveProperty('allowedApis');
    expect(schema[0].properties).not.toHaveProperty('allowedCalls');
  });

  it('fails clearly when parser services are missing', () => {
    const linter = new Linter();
    linter.defineRule('spaghetti', rules['no-spaghetti']);
    expect(() =>
      linter.verify('function run() {}', {
        parserOptions: { ecmaVersion: 2022 },
        rules: { spaghetti: 'error' },
      }),
    ).toThrow('requires type-aware parser services');
  });
});
