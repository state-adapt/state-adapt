import { adaptType, PatchState, Action } from './adapt.actions';

export function actionSanitizer(action: Action & PatchState) {
  return action.type === adaptType
    ? {
        ...action,
        action: undefined,
        actionType: undefined,
        source: undefined,
        payload: action.source.payload,
        type: action.source.type,
      }
    : action;
}
