import { AdapterDocs } from '@state-adapt/adapter-docs';
import booleanAdapterCode from '!!raw-loader!./boolean-adapter-demo';
import createBooleanAdapterCode from '!!raw-loader!./../../../../../../libs/core/adapters/src/lib/boolean.adapter';
import { booleanAdapter } from './boolean-adapter-demo';

export const booleanAdapterDocs: AdapterDocs = {
  name: 'booleanAdapter',
  description: 'Adapter for boolean state',
  sourceCode: createBooleanAdapterCode as unknown as string,
  parameters: [],
  demoAdapter: {
    value: booleanAdapter,
    stateChanges: {
      toggle: {
        demoPayload: 'null',
        documentation: 'Toggles state.',
      },
      setTrue: {
        demoPayload: 'null',
        documentation: 'Set state to true.',
      },
      setFalse: {
        demoPayload: 'null',
        documentation: 'Set state to false.',
      },
      noop: {
        demoPayload: 'null',
        documentation:
          'Returns previous state. Used to enable sources to dispatch for Redux Devtoos.',
      },
      set: {
        demoPayload: 'false',
        documentation: 'Sets state to value passed in payload.',
      },
      reset: {
        demoPayload: 'null',
        documentation: 'Resets state to initial state.',
      },
    },
    selectors: {},
    initialState: true,
    sourceCode: booleanAdapterCode,
  },
};
