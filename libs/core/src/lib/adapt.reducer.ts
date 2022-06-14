import { CommonAction, isPatchState, PatchState } from './adapt.actions';
import { updatePaths } from './update-paths.function';

export interface AdaptModel {
  [index: string]: any;
}

export function adaptReducer(
  state: AdaptModel = {},
  action: PatchState | CommonAction,
): AdaptModel {
  return isPatchState(action) ? updatePaths(state, action.payload) : state;
}
