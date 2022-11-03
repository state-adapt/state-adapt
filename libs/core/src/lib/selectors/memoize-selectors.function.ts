import { Selectors } from './selectors.interface';

export type WithStateSelector<State, S extends Selectors<State>> = S & {
  state: (state: State) => State;
};

export interface SelectorsCache {
  __id: number;
  __results: { [index: string]: any }; // All in one object means proxy object not needed to select against cached values
  __inputs: { [index: string]: { set: Set<string>; values: { [index: string]: any } } };
  __children: { [index: string]: SelectorsCache };
}

let cacheId = 0;

export const createSelectorsCache = (): SelectorsCache => {
  return {
    __id: cacheId++,
    __results: {},
    __inputs: {},
    __children: {},
  };
};

export const globalSelectorsCacheKey = '__stateadapt_selectors';
export const globalSelectorsCache = ((window as any)[globalSelectorsCacheKey] =
  createSelectorsCache());

export const serializeSelectorsCache = (c: SelectorsCache) => {
  const results = { ...c.__results };
  const children = c.__children;
  for (const prop in children) {
    results[prop] = serializeSelectorsCache(children[prop]);
  }
  return results;
};

export function memoizeSelectors<State, S extends Selectors<State>>(
  selectorDefinitions: S,
): WithStateSelector<State, S> {
  if (selectorDefinitions.state) return selectorDefinitions as any; // Already went through this function
  const selectors = { state: (s: State) => s } as any;
  for (const name in selectorDefinitions) {
    const fn = selectorDefinitions[name];
    selectors[name] = getMemoizedSelector(name, fn);
  }
  return selectors;
}

export function getMemoizedSelector<State>(
  name: string,
  fn: (s: State, fnCache?: SelectorsCache) => any,
  toChildCache?: (pc: SelectorsCache) => SelectorsCache,
) {
  return (s: State, parentCache: SelectorsCache) => {
    const cache = toChildCache ? toChildCache(parentCache) : parentCache;
    const { values } = (cache.__inputs[name] = cache.__inputs[name] || {
      set: new Set(['state']),
      values: { state: undefined },
    });
    if (s === values.state) return cache.__results[name]; // The only input "selector" returned the same thing
    values.state = s;
    return (cache.__results[name] = (fn as any)(s, cache));
  };
}
