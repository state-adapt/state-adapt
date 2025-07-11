import { createAdapter } from '@state-adapt/core';

/**
 * Adapter for boolean state management.
 * This adapter provides methods to set the state to true or false,
 * toggle the state, and create a base boolean adapter.
 */
export const booleanAdapter = createAdapter<boolean>()({
  setTrue: () => true,
  setFalse: () => false,
  toggle: state => !state,
});

export const baseBooleanAdapter = createAdapter<boolean>()({});
