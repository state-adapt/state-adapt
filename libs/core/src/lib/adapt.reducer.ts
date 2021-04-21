import { CommonAction, isPatchState, PatchState } from './adapt.actions';
import { updatePaths } from './update-paths.function';

export interface AdaptModel {
  [index: string]: any;
}

export function adaptReducer(
  state: AdaptModel | null = null,
  action: PatchState | CommonAction,
) {
  return isPatchState(action) ? updatePaths(state, action.payload) : action;
}
