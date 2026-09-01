import { Linter } from 'eslint';
import { NoSpaghettiApiPattern } from './no-spaghetti-options';
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
    ).toEqual(['javascript', 'dom']);
    expect(schema[0].additionalProperties).toBe(false);
  });

  it('requires exclusive method or function API patterns', () => {
    const schema = rules['no-spaghetti'].meta?.schema as Array<{
      properties: Record<string, { items?: { oneOf?: Array<Record<string, unknown>> } }>;
    }>;
    expect(schema[0].properties['apiPatterns'].items?.oneOf).toEqual([
      { required: ['methods'], not: { required: ['functions'] } },
      {
        required: ['functions'],
        not: {
          anyOf: [{ required: ['methods'] }, { required: ['receiverNames'] }],
        },
        properties: { resource: { enum: ['argument'] } },
      },
    ]);

    const valid: NoSpaghettiApiPattern = {
      name: 'cache.write',
      functions: ['writeCache'],
      resource: 'argument',
    };
    // @ts-expect-error Function patterns cannot use a method receiver.
    const invalidReceiver: NoSpaghettiApiPattern = {
      name: 'cache.write',
      functions: ['writeCache'],
      resource: 'receiver',
    };
    // @ts-expect-error A pattern cannot define both methods and functions.
    const invalidMixed: NoSpaghettiApiPattern = {
      name: 'cache.write',
      methods: ['write'],
      functions: ['writeCache'],
    };
    expect([valid, invalidReceiver, invalidMixed]).toHaveLength(3);
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
