import { Action } from '@ngrx/store';

export type Update = [string[], any];

export const adaptType = 'Adapt';

export class PatchState {
  readonly type = adaptType;
  constructor(
    public source: Action & { payload?: any },
    public payload: Update[]
  ) {}
}
