import { Injectable } from '@angular/core';
import { State, StateContext, Action } from '@ngxs/store';
import { PatchState, updatePaths } from '@state-adapt/core';

export interface AdaptModel {
  [index: string]: any;
}

const getAdaptModel = (): AdaptModel => ({});

@Injectable()
@State<AdaptModel>({
  name: 'adapt',
  defaults: getAdaptModel(),
})
export class AdaptState {
  @Action(PatchState)
  patchState(
    { getState, patchState }: StateContext<AdaptModel>,
    { payload }: PatchState
  ) {
    return patchState(updatePaths(getState(), payload));
  }
}
