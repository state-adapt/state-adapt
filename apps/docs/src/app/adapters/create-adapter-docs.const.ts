import createDemoAdapterCode from '!!raw-loader!!!md-loader!!!snippet-loader!./../../../../../libs/core/src/lib/adapters/create-adapter.function';
import demoAdapterCode from '!!raw-loader!!!md-loader!!!snippet-loader!./adapter-demo';
import { AdapterDocs } from '@state-adapt/adapter-docs';
import { adapter } from './adapter-demo';

console.log(demoAdapterCode);

export const createAdapterDocs: AdapterDocs = {
  name: 'createAdapter',
  description: 'Base adapter with basic operations: set and reset',
  sourceCode: createDemoAdapterCode,
  parameters: [],
  demoAdapter: {
    value: adapter,
    stateChanges: {
      set: {
        demoPayload: '{ "prop1": "New state set", "prop2": "New State set" }',
        documentation: 'Sets state to value passed in payload.',
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
