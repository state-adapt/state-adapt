import createDemoAdapterCode from '!!raw-loader!./../../../../../libs/core/src/lib/adapters/create-adapter.function';
import demoAdapterCode from '!!raw-loader!./adapter-demo';
import { AdapterDocs } from '@state-adapt/adapter-docs';
import { adapter } from './adapter-demo';

export const createAdapterDocs: AdapterDocs = {
  name: 'createAdapter',
  description: 'Base adapter with basic operations: noop, set, update and reset',
  sourceCode: createDemoAdapterCode as unknown as string,
  parameters: [],
  demoAdapter: {
    value: adapter,
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
      prop1: 'Initial state for base adapter demo',
      prop2: 'Initial state for base adapter demo',
    },
    sourceCode: demoAdapterCode,
  },
};
