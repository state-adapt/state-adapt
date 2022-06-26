import { updatePaths } from '../utils/update-paths.function';
import { CommonAction, isPatchState, PatchState } from './adapt.actions';

export interface AdaptModel {
  [index: string]: any;
}

export function adaptReducer(
  state: AdaptModel = {},
  action: PatchState | CommonAction,
): AdaptModel {
  return isPatchState(action) ? updatePaths(state, action.payload) : state;
}
