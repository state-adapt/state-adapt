import { createAdapter } from '@state-adapt/core';

export const booleanAdapter = createAdapter<boolean>()({
  setTrue: () => true,
  setFalse: () => false,
  toggle: state => !state,
});
