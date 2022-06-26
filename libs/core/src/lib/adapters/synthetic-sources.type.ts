import { ReactionsWithSelectors } from './adapter.type';
import { SecondParameterOrVoid } from './second-parameter-or-void.type';

export type ActionPayloadOrVoid<
  R extends { [index: string]: any },
  K extends keyof R,
> = SecondParameterOrVoid<Parameters<R[K]>>;

export type SyntheticSources<R extends ReactionsWithSelectors<any, any>> = {
  [K in keyof Omit<R, 'selectors'>]: (payload: ActionPayloadOrVoid<R, K>) => void;
};
