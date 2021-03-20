import { Action } from '@ngrx/store';
import { adaptType, PatchState } from './adapt.actions';

export function actionSanitizer(action: Action & PatchState) {
  return {
    ...action,
    action: undefined,
    actionType: undefined,
    source: undefined,
    payload: action.source.payload,
    type:
      action.type === adaptType
        ? `[${action.type}] ${action.source.type}`
        : action.type,
  };
}
