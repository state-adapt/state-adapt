import { createAdapter } from '@state-adapt/core';
import { Filters } from '../../../../../libs/shopping/src';

export const filterAdapter = createAdapter<Filters>()({
  toggleFilter: (state, key: keyof Filters) => ({
    ...state,
    [key]: !state[key],
  }),
});
