import { PrefixedAfterVerb } from '../utils/prefixed-after-verb.type';
import { ReactionsWithSelectors } from './adapter.type';

type NestedAdapter<
  ParentState extends Record<string, any>,
  PartialParentState extends Record<string, any>,
  Prefix extends Extract<keyof PartialParentState, string>,
  R extends ReactionsWithSelectors<ParentState[Prefix], any>,
> = {
  [K in Extract<keyof R, string> as K extends 'selectors'
    ? never
    : PrefixedAfterVerb<K, Prefix>]: R[K] extends (
    state: any,
    payload: any,
    initialState: any,
  ) => any
    ? (
        state: ParentState,
        payload: Parameters<R[K]>[1] extends void ? void : Parameters<R[K]>[1],
        initialState: ParentState,
      ) => ParentState
    : never;
} & {
  selectors: {
    [K in Prefix | Extract<keyof R['selectors'], string> as K extends Prefix
      ? K
      : `${Prefix}${Capitalize<K>}`]: (
      state: ParentState,
    ) => K extends Prefix ? ParentState[Prefix] : ReturnType<R['selectors'][K]>;
  };
};

type SuperState<AE extends AdapterEntries<any>> = {
  [K in keyof AE]: Parameters<
    AE[K][keyof AE[K]] extends (...args: any) => any ? AE[K][keyof AE[K]] : never
  >[0];
};

export type FlattendAdapters<
  AE extends AdapterEntries<any>,
  ParentState extends Record<string, any>,
> = {
  [NS in Extract<keyof AE, string>]: (
    x: NestedAdapter<ParentState, SuperState<AE>, NS, AE[NS]>,
  ) => void;
}[Extract<keyof AE, string>] extends (x: infer I) => void
  ? I
  : never;

export type AdapterEntries<SuperState> = {
  [K in keyof SuperState]: {
    [index: string]:
      | ((state: SuperState[K], event: any, initialState: SuperState[K]) => SuperState[K])
      | { [index: string]: (state: SuperState[K]) => any };
  };
};
