import { AdapterDocs } from '@state-adapt/adapter-docs';
import demoAdapterCode from '!!raw-loader!./basic.adapter';
import createDemoAdapterCode from '!!raw-loader!./../../../../../libs/core/src/lib/create-basic-adapter.function';
import { basicAdapter } from './basic.adapter';

export const createBasicAdapterDocs: AdapterDocs = {
  name: 'createBasicAdapter',
  description: 'Adapter for basic operations: set, update and reset',
  sourceCode: createDemoAdapterCode as unknown as string,
  parameters: [],
  demoAdapter: {
    value: basicAdapter,
    stateChanges: {
      noop: {
        demoPayload: 'null',
        documentation:
          'Returns previous state. Used to enable sources to dispatch for Redux Devtoos.',
      },
      set: {
        demoPayload: '{ "prop1": "New state set", "prop2": "New State set" }',
        documentation: 'Sets state to value passed in payload.',
      },
      update: {
        demoPayload: '{ "prop2": "Updated state" }',
        documentation: 'Spreads payload object onto existing state.',
      },
      reset: {
        demoPayload: 'null',
        documentation: 'Resets state to initial state.',
      },
    },
    selectors: {},
    initialState: {
      prop1: 'Initial state for basic adapter demo',
      prop2: 'Initial state for basic adapter demo',
    },
    sourceCode: demoAdapterCode,
  },
};
