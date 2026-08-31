const recognitionProperties: Record<string, unknown> = {
  apiPatterns: {
    type: 'array',
    items: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1 },
        methods: { type: 'array', items: { type: 'string' }, minItems: 1 },
        functions: { type: 'array', items: { type: 'string' }, minItems: 1 },
        receiverNames: { type: 'array', items: { type: 'string' } },
        importSources: { type: 'array', items: { type: 'string' } },
        resource: { enum: ['receiver', 'argument'] },
        argumentIndex: { type: 'integer', minimum: 0 },
      },
      oneOf: [{ required: ['methods'] }, { required: ['functions'] }],
      additionalProperties: false,
    },
  },
  builtInRecognizers: {
    type: 'array',
    uniqueItems: true,
    items: { enum: ['javascript', 'dom', 'redux'] },
  },
};

export const noSpaghettiSchema = [
  {
    type: 'object',
    properties: {
      max: { type: 'number', minimum: 0 },
      declarationLineWeight: { type: 'number', minimum: 0 },
      sameFunctionWeight: { type: 'number', minimum: 0 },
      scopeWeight: { type: 'number', minimum: 0 },
      functionCallWeight: { type: 'number', minimum: 0 },
      fileWeight: { type: 'number', minimum: 0 },
      folderWeight: { type: 'number', minimum: 0 },
      externalPenalty: {
        anyOf: [{ type: 'number', minimum: 0 }, { enum: ['maximum', 'ignore'] }],
      },
      allowedCalls: {
        type: 'array',
        uniqueItems: true,
        items: { type: 'string', minLength: 1 },
      },
      allowedApis: {
        type: 'array',
        uniqueItems: true,
        items: { type: 'string', minLength: 1 },
      },
      crossFileAnalysis: { type: 'boolean' },
      maxCallDepth: { type: 'integer', minimum: 0 },
      maxCommandsPerFunction: { type: 'integer', minimum: 1 },
      ...recognitionProperties,
    },
    additionalProperties: false,
  },
];
