export interface CommonAction {
  type: string;
}

export type Update = [string[], any];

export const adaptType = 'Adapt';

export interface PatchState {
  type: string;
  source: CommonAction & { payload?: any };
  payload: Update[];
}

export function createPatchState(
  source: CommonAction & { payload?: any },
  payload: Update[],
): PatchState {
  return {
    type: adaptType,
    source,
    payload,
  };
}

export function createInit(path: string, initialState: any) {
  return createPatchState({ type: `INIT ${path}` }, [
    [path.split('.'), initialState],
  ]);
}

export function createDestroy(path: string) {
  return createPatchState({ type: `DESTROY ${path}` }, [
    [path.split('.'), undefined],
  ]);
}
