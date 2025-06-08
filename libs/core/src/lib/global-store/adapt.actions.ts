import { isAction } from '../actions/is-action.function';

export interface CommonAction {
  type: string;
}

export type Update = [string[], any];

export const adaptType = 'Adapt';

export interface PatchState {
  type: typeof adaptType;
  source: CommonAction & { payload?: any };
  payload: Update[];
}

export function isPatchState(action: CommonAction | PatchState): action is PatchState {
  return action.type === adaptType;
}

export function createPatchState(
  value: any, // Either a payload, or an Action<Payload>
  payload: Update[],
  type = value?.type,
): PatchState {
  return {
    type: adaptType,
    source: isAction(value)
      ? value
      : {
          type,
          payload: value,
        },
    payload,
  };
}

export function createInit(path: string, initialState: any) {
  return createPatchState({ type: `INIT ${path}` }, [[path.split('.'), initialState]]);
}

export function createDestroy(path: string) {
  return createPatchState({ type: `DESTROY ${path}` }, [[path.split('.'), undefined]]);
}
