import { SelectorsCache } from './memoize-selectors.function';
import { Selectors } from './selectors.interface';

export type SelectorReturnTypes<State, S extends Selectors<State>> = {
  [Key in keyof S]: ReturnType<S[Key]>;
};

export type ReturnTypeSelectors<
  State,
  S1States,
  NewSelectors extends Selectors<S1States>,
> = {
  [Key in keyof NewSelectors]: (
    state: State,
    props?: any,
  ) => ReturnType<NewSelectors[Key]>;
};

/**
 *
 * @returns original selectors object with new selectors added (mutates)
 */
export function combineSelectors<State>() {
  return <
    S1 extends Selectors<State>,
    S1States extends SelectorReturnTypes<State, S1>,
    S2 extends Selectors<S1States>,
  >(
    selectors: S1,
    newSelectors: S2 = {} as S2,
    getCacheOverride?: (c: SelectorsCache) => SelectorsCache,
  ): S1 & ReturnTypeSelectors<State, S1States, S2> => {
    for (const name in newSelectors) {
      (selectors as any)[name] = memoizeWithProxy<State>()(
        name,
        selectors,
        newSelectors[name],
        getCacheOverride,
      );
    }

    return selectors as S1 & ReturnTypeSelectors<State, S1States, S2>;
  };
}

export function memoizeWithProxy<State>() {
  return <S1 extends Selectors<State>, S1States extends SelectorReturnTypes<State, S1>>(
    name: string,
    selectors: S1,
    fn: (s: S1States) => any,
    getCacheOverride?: (c: SelectorsCache) => SelectorsCache,
  ) => {
    return (s: State, providedCache?: SelectorsCache) => {
      const cache = getCacheOverride
        ? getCacheOverride(providedCache as SelectorsCache)
        : providedCache;

      // 1. No cache provided, just evaluate without memoization
      if (!cache) {
        const handler = {
          get: function (target: S1States, prop: string) {
            return target[selectors[prop](s)];
          },
        };
        const proxy = new Proxy(selectors as any as S1States, handler);
        return fn(proxy);
      }

      const results = cache.__results;
      const cachedResult = results[name];

      // 2. Get cached inputs, return cachedResult if results of cached inputs are all the same
      const inputs = cache.__inputs;
      const cachedInputs = (inputs[name] = inputs[name] || {
        set: new Set<string>(),
        values: {},
      });
      const cachedInputsSet = cachedInputs.set;
      const cachedInputValues = cachedInputs.values;

      // If all registered inputs record the same results, the final result will be the same (selectors are deterministic)
      // On initial run, no cachedInputs; skip past this optimization so an input can be added to cachedInputs
      // This calls each registered input which may have a cached value
      const allInputResultsSame =
        !!cachedInputsSet.size &&
        [...cachedInputsSet].every(inputName => {
          const previousInputValue = cachedInputValues[inputName];
          const newInputValue = (cachedInputValues[inputName] = (
            selectors[inputName] as any
          )(s, cache));
          return previousInputValue === newInputValue;
        });

      if (allInputResultsSame) return cachedResult;

      // 3. Recalculate
      // Pass proxy into fn to watch for additional input selectors being accessed
      const handler = {
        get: function (target: S1States, inputName: string) {
          cachedInputsSet.add(inputName);
          const newInputValue = (cachedInputValues[inputName] = (
            target[inputName] as any
          )(s, cache));
          return newInputValue;
        },
      };

      const proxy = new Proxy(selectors, handler);
      return (results[name] = fn(proxy as any));
    };
  };
}
