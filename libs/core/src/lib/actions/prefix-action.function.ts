import { Action } from './action.interface';
import { PrefixedAction } from './prefixed-action.type';

export function prefixAction<
  Prefix extends string,
  Type extends string = string,
  T = any,
>(
  prefix: Prefix,
  { type, payload }: Action<T, Type>,
): PrefixedAction<Prefix, Action<T, Type>> {
  return { type: `${prefix} ${type}`, payload };
}
