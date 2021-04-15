import { adaptType, PatchState } from './adapt.actions';
import { updatePaths } from './update-paths.function';

export interface AdaptModel {
  [index: string]: any;
}

export function adaptReducer(state: AdaptModel = null, action: PatchState) {
  switch (action.type) {
    case adaptType:
      return updatePaths(state, action.payload);
    default:
      return state;
  }
}
