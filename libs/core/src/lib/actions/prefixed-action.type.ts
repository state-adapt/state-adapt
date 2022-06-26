import { Action } from './action.interface';

export type PrefixedAction<Prefix extends string, A extends Action<any>> = {
  [K in keyof A]: K extends 'type' ? `${Prefix} ${A['type']}` : A[K];
};
