import { adaptType } from './adapt.actions';

export function actionSanitizer(action) {
  return {
    ...action,
    type:
      action.type === adaptType
        ? `[${action.type}] [${action.actionType}]`
        : action.type,
  };
}
