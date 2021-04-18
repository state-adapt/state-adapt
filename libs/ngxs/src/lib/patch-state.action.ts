import { adaptType, Update } from '../../../../libs/core/src';

export class PatchState {
  static readonly type = adaptType; // NGXS requires static, NgRx requires NOT static
  constructor(public actionType: string, public payload: Update[]) {}
}
