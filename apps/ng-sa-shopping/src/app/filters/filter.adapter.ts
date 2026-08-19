import { createAdapter } from '@state-adapt/core';
import { Filters } from '@state-adapt/shopping';

export const filterAdapter = createAdapter<Filters>()({
  toggleFilter: (state, key: keyof Filters) => ({
    ...state,
    [key]: !state[key],
  }),
});
