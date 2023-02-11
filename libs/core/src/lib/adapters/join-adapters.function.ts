import {
  createSelectorsCache,
  getMemoizedSelector,
  WithStateSelector,
} from '../selectors/memoize-selectors.function';
import { Selectors } from '../selectors/selectors.interface';
import { buildAdapter, NewBlockAdder } from './build-adapter.function';
import { ReactionsWithoutSelectors } from './build-adapter.types';
import { BasicAdapterMethods, createAdapter } from './create-adapter.function';
import {
  createUpdateReaction,
  WithUpdateReaction,
} from './create-update-reaction.function';
import { AdapterEntries, FlattendAdapters } from './join-adapters.types';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `joinAdapters`

  {@link joinAdapters} creates a complex adapter from simpler adapters by taking each of their state change
  functions and selectors and adding them to the new adapter with more specific names to distinguish them from
  each other. All state reaction names have their adapter's namespaces inserted after the first word, and all selector names
  get prepended with their adapter's namespace.

  The initial {@link joinAdapters} call returns the same thing as the {@link buildAdapter} call, so it can be called again and again with more objects inheriting from previous objects, until a final empty call `()` to get the final built adapter.

  #### Example: Basic `joinAdapters`

  ```tsx
  import { joinAdapters, createAdapter } from '@state-adapt/core';

  interface State {
    a: number;
    b: number;
  }

  const adapter = joinAdapters<NumbersState>()({
    a: createAdapter<number>()({}),
    b: createAdapter<number>()({
      setTo0: state => 0,
      selectors: {
        negative: state => state * -1,
      },
    }),
  })();
  ```

  This is the same as:

  ```tsx
  import { createAdapter } from '@state-adapt/core';

  interface State {
    a: number;
    b: number;
  }

  const adapter = createAdapter<State>()({
    setA: (state, newA: number) => ({...state, a: newA}),
    resetA: (state, payload: void, initialState) => ({...state, a: initialState.a}),
    setBTo0: (state, payload: void) => ({...state, b: 0}),
    setB: (state, newB: number) => ({...state, b: newB}),
    resetB: (state, payload: void, initialState) => ({...state, b: initialState.b}),
    set: (state, newState: State) => newState,
    reset: (state, payload: void, initialState) => initialState,
    update: (state, newState: Partial<State>) => ({...state, ...newState}),
    selectors: {
      a: state => state.a,
      b: state => state.b,
      bNegative: state => state.b * -1,
      state: state => state,
    },
  });
  ```

  #### Example: `joinAdapters` with `buildAdapters`-like syntax

  ```tsx
  import { joinAdapters, createAdapter } from '@state-adapt/core';
  import { numberAdapter } from './number.adapter';

  interface NumbersState {
    a: number;
    b: number;
  }

  const adapter = joinAdapters<NumbersState>()({
    a: numberAdapter,
    b: numberAdapter,
  })({
    // Selectors
    total: s => s.a + s.b,
  })({
    // Group reactions
    incrementAll: {
      a: numberAdapter.increment,
      b: numberAdapter.increment,
    },
  })(([selectors, reactions]) => ({
    // More reactions
    addBToA: state => ({ ...state, a: selectors.b(state) }),
    addAToB: state => ({ ...state, b: selectors.a(state) }),
  }))();
  ```

  For more details, see {@link buildAdapters}.

  #### Example: Auth

  ```tsx
  import { joinAdapters, createAdapter } from '@state-adapt/core';

  interface AuthState {
    username: string | null;
    password: string | null;
    isLoggedIn: boolean;
  }

  const authAdapter = joinAdapters<AuthState>()({
    username: createAdapter<string | null>()({}),
    password: createAdapter<string | null>()({}),
    isLoggedIn: createAdapter<boolean>()({
      login: () => true,
      logout: () => false,
    }),
  })();

  // Usage
  const initialState = { username: null, password: null, isLoggedIn: false };
  const newState = authAdapter.update(initialState, {
    username: 'bob',
    password: '1234',
  });
  // { username: 'bob', password '1234', isLoggedIn: false }
  ```

  #### Example: Cookies

  ```tsx
  import { joinAdapters, createAdapter } from '@state-adapt/core';

  interface CookieState {
    price: number;
    flavor: 'Chocolate Chip' | 'Oatmeal Raisin';
  }

  const cookieAdapter = joinAdapters<CookieState>()({
    price: createAdapter<number>()({
      selectors: {
        discounted: state => state * 0.9,
      },
    }),
    flavor: createAdapter<Flavor>()({
      setToChocolateChip: () => 'Chocolate Chip',
      setToOatmealRaisin: () => 'Oatmeal Raisin',
    }),
  })();

  interface CookiesState {
    favorite: CookieState;
    leastFavorite: CookieState;
  }
  const initialCookiesState: CookiesState = {
    favorite: {
      price: 200,
      flavor: 'Chocolate Chip',
    },
    leastFavorite: {
      price: 190,
      flavor: 'Oatmeal Raisin',
    },
  };

  const cookiesAdapter = joinAdapters<CookiesState>()({
    favorite: cookieAdapter,
    leastFavorite: cookieAdapter,
  })({
    totalPrice: s => s.favorite.price + s.leastFavorite.price,
  })({
    totalPriceDiscounted: s => s.totalPrice * 0.9,
  })();

  // Usage
  cookiesAdapter.setFavoriteToOatmealRaisin(initialCookiesState);
  cookiesAdapter.setLeastFavoriteToOatmealRaisin(initialCookiesState);
  const favoritePriceDiscounted =
    cookiesAdapter.selectors.favoritePriceDiscounted(initialCookiesState);
  const totalPrice = cookiesAdapter.selectors.totalPrice(initialCookiesState);
  const totalPriceDiscounted =
    cookiesAdapter.selectors.totalPriceDiscounted(initialCookiesState);
  ```

  #### Example: Olympic Sports

  ```tsx
  import { joinAdapters, createAdapter } from '@state-adapt/core';

  interface SportState {
    name: string;
    isOlympic: boolean;
  }

  const sportAdapter = joinAdapters<SportState>()({
    name: createAdapter<string>()({
      setToSoccer: () => 'soccer',
      setToBasketball: () => 'basketball',
    }),
    isOlympic: createAdapter<boolean>()({
      setToTrue: () => true,
      setToFalse: () => false,
    }),
  })({
    isOlympicAndSoccer: s => s.isOlympic && s.name === 'soccer',
    isOlympicAndBasketball: s => s.isOlympic && s.name === 'basketball',
  })({
    setToOlympicSoccer: {
      name: () => 'soccer',
      isOlympic: () => true,
    },
  })();
  ```

 */
export function joinAdapters<
  ParentState extends Record<string, any>,
  ExtraProps extends string = '',
>() {
  return <AE extends AdapterEntries<Omit<ParentState, ExtraProps>>>(
    adapterEntries: AE,
  ): NewBlockAdder<
    ParentState,
    FlattendAdapters<AE, ParentState> extends { selectors: infer S }
      ? S extends Selectors<ParentState>
        ? WithStateSelector<ParentState, S>
        : WithStateSelector<ParentState, Record<string, (state: ParentState) => any>>
      : {},
    ReactionsWithoutSelectors<
      ParentState,
      FlattendAdapters<AE, ParentState> &
        BasicAdapterMethods<ParentState> &
        WithUpdateReaction<ParentState>
    >
  > => {
    const joinedAdapters: any = createAdapter<ParentState>()({});
    joinedAdapters.update = createUpdateReaction();
    const ignoredKeys = ['noop', 'selectors'];
    for (const namespace in adapterEntries) {
      const adapter = adapterEntries[namespace];
      for (const reactionName in adapter) {
        if (ignoredKeys.includes(reactionName)) continue;
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
          [namespace]: (adapter[reactionName] as any)(
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
          const selector = (adapter.selectors as any)[selectorName];
          const newSelectorName = `${namespace}${
            selectorName.charAt(0).toUpperCase() + selectorName.substring(1)
          }`;

          joinedAdapters.selectors[newSelectorName] = getMemoizedSelector(
            newSelectorName,
            (state: any, cache) => selector(state[namespace], cache),
            parentCache => {
              const children = parentCache!.__children;
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
