import { PatchState, CommonAction, isPatchState } from './adapt.actions';

export function actionSanitizer(action: CommonAction | PatchState) {
  return isPatchState(action)
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
