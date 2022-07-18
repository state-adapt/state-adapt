import { ReactionsWithSelectors } from './adapter.type';
import { SecondParameterOrAny } from './second-parameter-or-any.type';

type PayloadMaps<R extends ReactionsWithSelectors<any, any>> = {
  [K in string & keyof R]: (newPayload: any) => SecondParameterOrAny<Parameters<R[K]>>;
};

type MappedReactions<
  R extends ReactionsWithSelectors<any, any>,
  M extends Partial<PayloadMaps<R>>,
> = {
  [K in string & keyof M]: M[K] extends (newPayload: infer P) => any
    ? P extends undefined
      ? (
          state: ReturnType<R[K]>,
          payload?: P,
          initialState?: ReturnType<R[K]>,
        ) => ReturnType<R[K]>
      : (
          state: ReturnType<R[K]>,
          payload: P,
          initialState: ReturnType<R[K]>,
        ) => ReturnType<R[K]>
    : never;
};

export function mapPayloads<
  R extends ReactionsWithSelectors<any, any>,
  M extends Partial<PayloadMaps<R>>,
>(reactions: R, maps: M): MappedReactions<R, M> {
  const newReactions = {} as any;
  for (const prop in maps) {
    const map = maps[prop] as any;
    const reaction = reactions[prop];
    newReactions[prop] = (state: any, payload: any, initialState: any) =>
      reaction(state, map(payload), initialState);
  }
  return newReactions;
}
