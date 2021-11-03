interface Selectors<State> {
  [index: string]: (state: State, props?: any) => any;
}

type SelectorReturnTypes<State, S extends Selectors<State>> = {
  [Key in keyof S]: ReturnType<S[Key]>;
};

type ReturnTypeSelectors<State, S1States, NewSelectors extends Selectors<S1States>> = {
  [Key in keyof NewSelectors]: (
    state: State,
    props?: any,
  ) => ReturnType<NewSelectors[Key]>;
};

type WithStateSelector<State, S extends Selectors<State>> = S & {
  state: (state: State) => State;
};

type SelectorsCreator<State> = {
  // ====================================================================================== 1
  <S extends Selectors<State>, S1 extends WithStateSelector<State, S>>(selectors1: S): S1;
  // ====================================================================================== 2
  <
    S extends Selectors<State>,
    S1 extends WithStateSelector<State, S>,
    S1States extends SelectorReturnTypes<State, S1>,
    S2 extends Selectors<S1States>
  >(
    selectors1: S,
    selectors2: S2,
  ): S1 & ReturnTypeSelectors<State, S1States, S2>;
  // ====================================================================================== 3
  <
    S extends Selectors<State>,
    S1 extends WithStateSelector<State, S>,
    S1States extends SelectorReturnTypes<State, S1>,
    S2 extends Selectors<S1States>,
    S2States extends SelectorReturnTypes<State, S1 & S2>,
    S3 extends Selectors<S1States & S2States>
  >(
    selectors1: S,
    selectors2: S2,
    selectors3: S3,
  ): S1 & ReturnTypeSelectors<State, S1States & S2States, S2 & S3>;
  // ====================================================================================== 4
  <
    S extends Selectors<State>,
    S1 extends WithStateSelector<State, S>,
    S1States extends SelectorReturnTypes<State, S1>,
    S2 extends Selectors<S1States>,
    S2States extends SelectorReturnTypes<State, S1 & S2>,
    S3 extends Selectors<S1States & S2States>,
    S3States extends SelectorReturnTypes<State, S1 & S2 & S3>,
    S4 extends Selectors<S1States & S2States & S3States>
  >(
    selectors1: S,
    selectors2: S2,
    selectors3: S3,
    selectors4: S4,
  ): S1 & ReturnTypeSelectors<State, S1States & S2States & S3States, S2 & S3 & S4>;
  // ====================================================================================== 5
  <
    S extends Selectors<State>,
    S1 extends WithStateSelector<State, S>,
    S1States extends SelectorReturnTypes<State, S1>,
    S2 extends Selectors<S1States>,
    S2States extends SelectorReturnTypes<State, S1 & S2>,
    S3 extends Selectors<S1States & S2States>,
    S3States extends SelectorReturnTypes<State, S1 & S2 & S3>,
    S4 extends Selectors<S1States & S3States>,
    S4States extends SelectorReturnTypes<State, S1 & S2 & S3 & S4>,
    S5 extends Selectors<S1States & S2States & S3States & S4States>
  >(
    selectors1: S,
    selectors2: S2,
    selectors3: S3,
    selectors4: S4,
    selectors5: S5,
  ): S1 &
    ReturnTypeSelectors<
      State,
      S1States & S2States & S3States & S4States,
      S2 & S3 & S4 & S5
    >;
  // ====================================================================================== 6
  <
    S extends Selectors<State>,
    S1 extends WithStateSelector<State, S>,
    S1States extends SelectorReturnTypes<State, S1>,
    S2 extends Selectors<S1States>,
    S2States extends SelectorReturnTypes<State, S1 & S2>,
    S3 extends Selectors<S1States & S2States>,
    S3States extends SelectorReturnTypes<State, S1 & S2 & S3>,
    S4 extends Selectors<S1States & S3States>,
    S4States extends SelectorReturnTypes<State, S1 & S2 & S3 & S4>,
    S5 extends Selectors<S1States & S2States & S3States & S4States>,
    S5States extends SelectorReturnTypes<State, S1 & S2 & S3 & S4 & S5>,
    S6 extends Selectors<S1States & S2States & S3States & S4States & S5States>
  >(
    selectors1: S,
    selectors2: S2,
    selectors3: S3,
    selectors4: S4,
    selectors5: S5,
    selectors6: S6,
  ): S1 &
    ReturnTypeSelectors<
      State,
      S1States & S2States & S3States & S4States & S5States,
      S2 & S3 & S4 & S5 & S6
    >;
  // ====================================================================================== 7
  <
    S extends Selectors<State>,
    S1 extends WithStateSelector<State, S>,
    S1States extends SelectorReturnTypes<State, S1>,
    S2 extends Selectors<S1States>,
    S2States extends SelectorReturnTypes<State, S1 & S2>,
    S3 extends Selectors<S1States & S2States>,
    S3States extends SelectorReturnTypes<State, S1 & S2 & S3>,
    S4 extends Selectors<S1States & S3States>,
    S4States extends SelectorReturnTypes<State, S1 & S2 & S3 & S4>,
    S5 extends Selectors<S1States & S2States & S3States & S4States>,
    S5States extends SelectorReturnTypes<State, S1 & S2 & S3 & S4 & S5>,
    S6 extends Selectors<S1States & S2States & S3States & S4States & S5States>,
    S6States extends SelectorReturnTypes<State, S1 & S2 & S3 & S4 & S5 & S6>,
    S7 extends Selectors<S1States & S2States & S3States & S4States & S5States & S6States>
  >(
    selectors1: S,
    selectors2: S2,
    selectors3: S3,
    selectors4: S4,
    selectors5: S5,
    selectors6: S6,
    selectors7: S7,
  ): S1 &
    ReturnTypeSelectors<
      State,
      S1States & S2States & S3States & S4States & S5States & S6States,
      S2 & S3 & S4 & S5 & S6 & S7
    >;
};

export function createSelectorsFn([selectors1, ...args]: any) {
  return args.reduce(
    (selectors: any, newSelectors: any) =>
      combineSelectors<any>()<any, any, any>(selectors, newSelectors),
    { ...selectors1, state: (state: any) => state },
  );
}

export function createSelectors<State>(): SelectorsCreator<State> {
  return (...args: any) => {
    return createSelectorsFn(args);
  };
}

function combineSelectors<State>() {
  return <
    S1 extends Selectors<State>,
    S1States extends SelectorReturnTypes<State, S1>,
    S2 extends Selectors<S1States>
  >(
    selectors: S1,
    newSelectors: S2 = {} as S2,
  ): S1 & ReturnTypeSelectors<State, S1States, S2> => {
    let latestState: State;
    let inputResults = {} as Partial<S1States>;
    let previousInputResults = {} as Partial<S1States>;
    const selectorInputs = {} as Partial<{ [Key in keyof S2]: Set<keyof S1> }>;
    const results = {} as Partial<SelectorReturnTypes<S1States, S2>>;

    const newStateSelectors = Object.entries(newSelectors).reduce(
      (all, [name, fn]) => ({
        ...all,
        [name]: (s: State) => {
          if (s !== latestState) {
            latestState = s;
            previousInputResults = inputResults;
            inputResults = {};
          }
          selectorInputs[name as keyof S2] = selectorInputs[name] || new Set();
          const selectorInputNames = [
            ...(selectorInputs[name as keyof S2] as Set<keyof S1>),
          ];

          // If no inputs, just call fn again
          // If all inputs so far record the same results, the final result will be the same (selectors are deterministic)
          const sameInputResults =
            !!selectorInputNames.length &&
            selectorInputNames.every(inputName => {
              if (inputResults[inputName] === undefined) {
                inputResults[inputName] = selectors[inputName](s);
              }
              return previousInputResults[inputName] === inputResults[inputName];
            });

          if (sameInputResults) {
            if (results[name] === undefined) {
              results[name as keyof S2] = fn(inputResults as S1States);
            }
            return results[name];
          }

          //   Pass existing inputResults into fn with proxy to watch for additional input selectors being accessed
          //     (In proxy handler set each cachedInputResult and add to selectorInputNames as needed)
          //   Set and return cachedResult
          const handler = {
            get: function (target: S1States, prop: string) {
              selectorInputs[name]?.add(prop);
              const inputResult = target[prop];
              if (inputResult === undefined) {
                target[prop as keyof S1] = selectors[prop](s);
              }
              return target[prop];
            },
          };

          const proxy = new Proxy(inputResults as S1States, handler);
          const result = fn(proxy);
          results[name as keyof S2] = result;
          return result;
        },
      }),
      {} as ReturnTypeSelectors<State, S1States, S2>,
    );

    return {
      ...selectors,
      ...newStateSelectors,
    };
  };
}
