export type Update = [string[], any];

export const adaptType = 'Adapt';

export class PatchState {
  readonly type = adaptType;
  constructor(public actionType: string, public payload: Update[]) {}
}
