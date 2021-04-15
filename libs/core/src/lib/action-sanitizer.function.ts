import { adaptType, PatchState, CommonAction } from './adapt.actions';

export function actionSanitizer(action: CommonAction & PatchState) {
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
