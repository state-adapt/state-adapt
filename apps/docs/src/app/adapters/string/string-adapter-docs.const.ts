import { AdapterDocs } from '@state-adapt/adapter-docs';
import stringAdapterCode from '!!raw-loader!!!md-loader!!!snippet-loader!./string-adapter-demo';
import createStringAdapterCode from '!!raw-loader!!!md-loader!!!snippet-loader!./../../../../../../libs/core/adapters/src/lib/string.adapter';
import { stringAdapter } from './string-adapter-demo';

export const stringAdapterDocs: AdapterDocs = {
  name: 'stringAdapter',
  description: 'Adapter for string state',
  sourceCode: createStringAdapterCode as unknown as string,
  parameters: [],
  demoAdapter: {
    value: stringAdapter,
    stateChanges: {
      set: {
        demoPayload: '"100"',
        documentation: 'Sets state to value passed in payload.',
      },
      reset: {
        demoPayload: 'null',
        documentation: 'Resets state to initial state.',
      },
      concat: {
        demoPayload: '" Saget!"',
        documentation: 'Concatenates state with payload',
      },
      lowercase: {
        demoPayload: 'null',
        documentation: 'Converts state to lowercase',
      },
      uppercase: {
        demoPayload: 'null',
        documentation: 'Converts state to uppercase',
      },
    },
    selectors: {
      lowercase: {
        documentation: 'Returns state.toLowerCase()',
      },
      uppercase: {
        documentation: 'Returns state.toUpperCase()',
      },
    },
    initialState: 'Bob',
    sourceCode: stringAdapterCode,
  },
};
