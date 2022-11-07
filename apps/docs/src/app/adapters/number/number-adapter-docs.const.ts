import { AdapterDocs } from '@state-adapt/adapter-docs';
import numberAdapterCode from '!!raw-loader!./number-adapter-demo';
import createNumberAdapterCode from '!!raw-loader!./../../../../../../libs/core/adapters/src/lib/number.adapter';
import { numberAdapter } from './number-adapter-demo';

export const numberAdapterDocs: AdapterDocs = {
  name: 'numberAdapter',
  description: 'Adapter for number state',
  sourceCode: createNumberAdapterCode as unknown as string,
  parameters: [],
  demoAdapter: {
    value: numberAdapter,
    stateChanges: {
      increment: {
        demoPayload: 'null',
        documentation: 'Increments state by 1',
      },
      decrement: {
        demoPayload: 'null',
        documentation: 'Decrements state by 1',
      },
      add: {
        demoPayload: '7',
        documentation: 'Adds payload to state',
      },
      subtract: {
        demoPayload: '7',
        documentation: 'Subtracts payload from state',
      },
      multiply: {
        demoPayload: '2',
        documentation: 'Multiplies state by payload',
      },
      divide: {
        demoPayload: '2',
        documentation: 'Divides state by payload',
      },
      pow: {
        demoPayload: '3',
        documentation: 'Raises state to the power of the payload',
      },
      sqrt: {
        demoPayload: 'null',
        documentation: 'Square roots state',
      },
      max: {
        demoPayload: '10',
        documentation: 'Sets state to the maximum of the previous state and the payload',
      },
      min: {
        demoPayload: '-10',
        documentation: 'Sets state to the minimum of the previous state and the payload',
      },
      noop: {
        demoPayload: 'null',
        documentation:
          'Returns previous state. Used to enable sources to dispatch for Redux Devtoos.',
      },
      set: {
        demoPayload: '100',
        documentation: 'Sets state to value passed in payload.',
      },
      reset: {
        demoPayload: 'null',
        documentation: 'Resets state to initial state.',
      },
    },
    selectors: {},
    initialState: 1,
    sourceCode: numberAdapterCode,
  },
};
