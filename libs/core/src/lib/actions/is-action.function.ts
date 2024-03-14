import { Action } from './action.interface';

export function isAction(thing: unknown): thing is Action<any> {
  return typeof thing === 'object' && thing != null
    && 'type' in thing && 'payload' in thing;
}
