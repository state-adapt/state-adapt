export type Update = [string[], any];

export class PatchState {
  static readonly type = 'Adapt';
  constructor(public actionType: string, public payload: Update[]) {}
}
