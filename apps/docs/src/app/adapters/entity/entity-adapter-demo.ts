import { joinAdapters } from '@state-adapt/core';
import {
  booleanAdapter,
  baseStringAdapter,
  createEntityAdapter,
  createEntityState,
} from '@state-adapt/core/adapters';

interface Option {
  id: string;
  name: string;
  selected: boolean;
}

const optionAdapter = joinAdapters<Option, 'id'>()({
  name: baseStringAdapter,
  selected: booleanAdapter,
})();

export const entityAdapter = createEntityAdapter<Option>()(optionAdapter, {
  filters: ['selected'],
  sorters: ['name'],
});

// export const initialState = createEntityState<Option>()
export const initialState = {
  ids: ['1', '2'],
  entities: {
    1: {
      id: '1',
      name: 'Jimmy',
      selected: false,
    },
    2: {
      id: '2',
      name: 'Sally',
      selected: false,
    },
  },
};

// optionsAdapter.updateAllName(initialState, 'Jimmy', initialState);
