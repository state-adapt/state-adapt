const recognitionProperties: Record<string, unknown> = {
  apis: {
    type: 'array',
    items: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1 },
        penalty: { type: 'number', minimum: 0 },
        methods: { type: 'array', items: { type: 'string' }, minItems: 1 },
        functions: { type: 'array', items: { type: 'string' }, minItems: 1 },
        calls: { type: 'array', items: { type: 'string' }, minItems: 1 },
        receiverNames: { type: 'array', items: { type: 'string' } },
        importSources: { type: 'array', items: { type: 'string' } },
        resource: { enum: ['receiver', 'argument', 'callee'] },
        argumentIndex: { type: 'integer', minimum: 0 },
      },
      oneOf: [
        {
          required: ['methods'],
          not: { anyOf: [{ required: ['functions'] }, { required: ['calls'] }] },
          properties: { resource: { enum: ['receiver', 'argument'] } },
        },
        {
          required: ['functions'],
          not: {
            anyOf: [
              { required: ['methods'] },
              { required: ['calls'] },
              { required: ['receiverNames'] },
            ],
          },
          properties: { resource: { enum: ['argument', 'callee'] } },
        },
        {
          required: ['calls'],
          not: {
            anyOf: [
              { required: ['methods'] },
              { required: ['functions'] },
              { required: ['receiverNames'] },
              { required: ['importSources'] },
              { required: ['resource'] },
              { required: ['argumentIndex'] },
            ],
          },
        },
        {
          required: ['penalty'],
          not: {
            anyOf: [
              { required: ['methods'] },
              { required: ['functions'] },
              { required: ['calls'] },
              { required: ['receiverNames'] },
              { required: ['importSources'] },
              { required: ['resource'] },
              { required: ['argumentIndex'] },
            ],
          },
        },
      ],
      additionalProperties: false,
    },
  },
  builtInRecognizers: {
    type: 'array',
    uniqueItems: true,
    items: { enum: ['javascript', 'dom', 'framework'] },
  },
};

export const noSpaghettiSchema = [
  {
    type: 'object',
    properties: {
      maxScore: { type: 'number', minimum: 0 },
      declarationLineDistanceWeight: { type: 'number', minimum: 0 },
      scopeWeight: { type: 'number', minimum: 0 },
      fileWeight: { type: 'number', minimum: 0 },
      folderWeight: { type: 'number', minimum: 0 },
      externalPenalty: { type: 'number', minimum: 0 },
      crossFileAnalysis: { type: 'boolean' },
      maxCallDepth: { type: 'integer', minimum: 0 },
      maxCommandsPerFunction: { type: 'integer', minimum: 1 },
      ...recognitionProperties,
    },
    additionalProperties: false,
  },
];
