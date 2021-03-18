import { PatchState } from './adapt.actions';

export function actionSanitizer(action) {
  return {
    ...action,
    type:
      action.type === PatchState.type
        ? `[${action.type}] [${action.actionType}]`
        : action.type,
  };
}
