import {
  createSelectorsCache,
  getMemoizedSelector,
  WithStateSelector,
} from '../selectors/memoize-selectors.function';
import { Selectors } from '../selectors/selectors.interface';
import { PrefixedAfterVerb } from '../utils/prefixed-after-verb.type';
import { ReactionsWithSelectors } from './adapter.type';
import {
  buildAdapter,
  NewBlockAdder,
  ReactionsFromAdapter,
} from './build-adapter.function';
import { BasicAdapterMethods } from './create-adapter.function';

type NestedAdapter<
  ParentState extends Record<string, any>,
  PartialParentState extends Record<string, any>,
  Prefix extends Extract<keyof PartialParentState, string>,
  R extends ReactionsWithSelectors<ParentState[Prefix], any>,
> = {
  [K in Extract<keyof R, string> as K extends 'selectors' | 'noop'
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
    ) => K extends Prefix ? Parameters<R[keyof R]>[0] : ReturnType<R['selectors'][K]>;
  };
};

type SuperState<AE extends AdapterEntries<any>> = {
  [K in keyof AE]: Parameters<AE[K][keyof AE[K]]>[0];
};

type FlattendAdapters<
  AE extends AdapterEntries<any>,
  ParentState extends Record<string, any>,
> = {
  [NS in Extract<keyof AE, string>]: (
    x: NestedAdapter<ParentState, SuperState<AE>, NS, AE[NS]>,
  ) => void;
}[Extract<keyof AE, string>] extends (x: infer I) => void
  ? I
  : never;

type AdapterEntries<SuperState extends Record<string, any>> = {
  [K in keyof SuperState]: ReactionsWithSelectors<SuperState[K], any>;
};

export function joinAdapters<ParentState extends Record<string, any>>() {
  return <AE extends AdapterEntries<Partial<ParentState>>>(
    adapterEntries: AE,
  ): NewBlockAdder<
    ParentState,
    ReactionsFromAdapter<FlattendAdapters<AE, ParentState>> &
      BasicAdapterMethods<ParentState>,
    FlattendAdapters<AE, ParentState> extends { selectors: infer S }
      ? S extends Selectors<ParentState>
        ? WithStateSelector<ParentState, S>
        : WithStateSelector<ParentState, Record<string, (state: ParentState) => any>>
      : {}
  > => {
    const joinedAdapters: any = { selectors: { state: (state: any) => state } };
    for (const namespace in adapterEntries) {
      const adapter = adapterEntries[namespace];
      for (const reactionName in adapter) {
        if (reactionName === 'selectors') continue;
        const firstCapIdx = reactionName.match(/(?=[A-Z])/)?.index ?? reactionName.length;
        const verb = reactionName.substring(0, firstCapIdx);
        const rest = reactionName.substring(firstCapIdx);
        const newReactionName = `${verb}${
          namespace.charAt(0).toUpperCase() + namespace.substr(1)
        }${rest}`;
        joinedAdapters[newReactionName] = (
          state: any,
          payload: any,
          initialState: any,
        ) => ({
          ...state,
          [namespace]: adapter[reactionName](
            state[namespace],
            payload,
            initialState[namespace],
          ),
        });
      }
      joinedAdapters.selectors[namespace] = getMemoizedSelector(
        namespace,
        (state: any) => state[namespace],
      );
      if (adapter.selectors) {
        for (const selectorName in adapter.selectors) {
          const selector = adapter.selectors[selectorName];
          const newSelectorName = `${namespace}${
            selectorName.charAt(0).toUpperCase() + selectorName.substring(1)
          }`;

          joinedAdapters.selectors[newSelectorName] = getMemoizedSelector(
            newSelectorName,
            (state: any, cache) => selector(state[namespace], cache),
            parentCache => {
              const children = parentCache.__children;
              return (children[namespace] =
                children[namespace] || createSelectorsCache());
            },
          );
        }
      }
    }

    return buildAdapter<ParentState>()(joinedAdapters) as any;
  };
}
