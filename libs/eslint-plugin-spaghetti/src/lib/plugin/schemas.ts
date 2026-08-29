const scoringSchema: Record<string, unknown> = {
  type: 'object',
  properties: {
    declarationLineDistanceWeight: { type: 'number', minimum: 0 },
    sameFunctionDistanceWeight: { type: 'number', minimum: 0 },
    scopeCrossingWeight: { type: 'number', minimum: 0 },
    fileCrossingWeight: { type: 'number', minimum: 0 },
    folderCrossingWeight: { type: 'number', minimum: 0 },
    functionCallDistanceWeight: { type: 'number', minimum: 0 },
    functionSizeWeight: { type: 'number', minimum: 0 },
    baseScores: {
      type: 'object',
      additionalProperties: { type: 'number', minimum: 0 },
    },
    apiBaseScores: {
      type: 'object',
      additionalProperties: { type: 'number', minimum: 0 },
    },
  },
  additionalProperties: false,
};

const recognitionSchema: Record<string, unknown> = {
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

const analysisProperties = {
  scoring: scoringSchema,
  crossFileAnalysis: { type: 'boolean' },
  maxCallDepth: { type: 'integer', minimum: 0 },
  maxCommandsPerFunction: { type: 'integer', minimum: 1 },
  ...recognitionSchema,
};

export const maxSchema = [
  {
    type: 'object',
    properties: {
      max: { type: 'number', minimum: 0 },
      ...analysisProperties,
    },
    additionalProperties: false,
  },
];

export const distanceSchema = [
  {
    type: 'object',
    properties: {
      max: { type: 'number', minimum: 0 },
      declarationLineWeight: { type: 'number', minimum: 0 },
      scopeWeight: { type: 'number', minimum: 0 },
      functionCallWeight: { type: 'number', minimum: 0 },
      fileWeight: { type: 'number', minimum: 0 },
      folderWeight: { type: 'number', minimum: 0 },
      sameFunctionWeight: { type: 'number', minimum: 0 },
      ...analysisProperties,
    },
    additionalProperties: false,
  },
];

export const analysisSchema = [
  {
    type: 'object',
    properties: analysisProperties,
    additionalProperties: false,
  },
];
