import { Injectable } from '@angular/core';
import { State, StateContext, Action } from '@ngxs/store';
import { updatePaths } from '../../../../libs/core/src';
import { PatchState } from './patch-state.action';

export interface AdaptModel {
  [index: string]: any;
}

@Injectable()
@State<AdaptModel>({
  name: 'adapt',
  defaults: {} as AdaptModel,
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
