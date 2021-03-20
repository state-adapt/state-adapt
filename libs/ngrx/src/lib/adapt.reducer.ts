import { adaptType, PatchState, updatePaths } from '@state-adapt/core';

export interface AdaptModel {
  [index: string]: any;
}

export function adaptReducer(state: AdaptModel, action: PatchState) {
  switch (action.type) {
    case adaptType:
      return updatePaths(state, action.payload);
    default:
      return state;
  }
}
