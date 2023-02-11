import {
  Action,
  createNoopReaction,
  createUpdateReaction,
  getId,
} from '@state-adapt/core';
import {
  Adapter,
  BasicAdapterMethods,
  createAdapter,
  createDestroy,
  createInit,
  createPatchState,
  flatten,
  getAction,
  Reactions,
  ReactionsWithSelectors,
  Selectors,
  SyntheticSources,
  WithGetState,
  createSelectorsCache,
  getMemoizedSelector,
  globalSelectorsCache,
  SelectorsCache,
} from '@state-adapt/core';
import { defer, merge, NEVER, Observable, of, using } from 'rxjs';
import { distinctUntilChanged, filter, finalize, share, tap } from 'rxjs/operators';
import { isSource } from '../sources/is-source.function';
import { Selections } from '../stores/selections.type';
import { SmartStore } from '../stores/smart-store.interface';
import { Sources } from '../stores/sources.type';
import { InitializedReactions, GlobalStoreMethods } from './state-adapt.types';

interface ParsedPath {
  path: string;
  pathAr: string[];
}

const filterDefined = <T>(sel$: Observable<T>) =>
  sel$.pipe(
    filter(a => a !== undefined),
    distinctUntilChanged(),
  );

interface PathState {
  lastState: any;
  initialState: any;
  arr: string[];
  selectorsCache: SelectorsCache;
}

interface PathStates {
  [index: string]: PathState;
}

interface UpdaterStream {
  source$: Observable<Action<any>>;
  requireSources$: Observable<any>;
  reactions: {
    path: string;
    reaction: (...args: any[]) => any;
  }[];
}

export class StateAdapt<CommonStore extends GlobalStoreMethods = any> {
  private pathStates: PathStates = {};
  private updaterStreams: UpdaterStream[] = [];

  constructor(private commonStore: CommonStore) {}

  /**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `StateAdapt.adapt`

  > Copilot tip: Copy examples into your file or click to definition to open file with context for better Copilot suggestions.

  `adapt` creates a store that will manage state while it has subscribers. There are 4 overloads for `adapt`:

  ### Overloads
  ```javascript
  adapt(path, initialState)
  adapt([path, initialState], adapter)
  adapt([path, initialState], sources)
  adapt([path, initialState, adapter], sources)
  ```

  path: `string` — Object path in Redux Devtools

  initialState: {@link State} — Initial state of the store when it gets initialized with a subscription to its state

  adapter: {@link Adapter} — Object with state change functions and selectors

  sources:
  - [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>> — Single source for `set` state change
  - [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>[] — Array of sources for `set` state change
  - {@link Sources} — Object specifying sources for state change functions

  ### Overload 1
  `adapt(path, initialState)`

  The path string specifies the location in the global store you will find the state for the store being created
  (while the store has subscribers). StateAdapt splits this string at periods `'.'` to create an object path within
  the global store. Here are some example paths and the resulting global state objects:

  #### Example: Paths and global state

  ```typescript
  const store = adapt('number', 0);
  store.state$.subscribe();
  // global state: { number: 0 }

  const store = adapt('featureA.number', 0);
  store.state$.subscribe();
  // global state: { featureA: { number: 0 } }

  const store = adapt('featureA.featureB.number', 0);
  store.state$.subscribe();
  // global state: { featureA: { featureB: { number: 0 } } }
  ```

  Each store completely owns its own state. If more than one store tries to use the same path, StateAdapt will throw this error:

  `Path '${path}' collides with '${existingPath}', which has already been initialized as a state path.`

  This applies both to paths that are identical as well as paths that are subtrings of each other. For example, if `'featureA'`
  is already being used by a store and then another store tried to initialize at `'featureA.number'`, that error would be thrown.

  To help avoid this error, StateAdapt provides a {@link getId} function that can be used to generate unique paths:

  #### Example: getId for unique paths

  ```typescript
  import { getId } from '@state-adapt/core';

  const store1 = adapt('number' + getId(), 0);
  store1.state$.subscribe();
  const store2 = adapt('number' + getId(), 0);
  store2.state$.subscribe();
  // global state: { number0: 0, number1: 0 }
  ```

  `adapt` returns a store object that is ready to start managing state once it has subscribers. The store object comes with `set`
  and `reset` methods for updating the state, and a `state$` observable of the store's state.

  #### Example: `set`, `reset` and `state$`

  ```tsx
  const name = adapt('name', 'John');
  name.state$.subscribe(console.log);
  name.set('Johnsh'); // logs 'Johnsh'
  name.reset(); // logs 'John'
  ```

  Usually you won't manually subscribe to state like this, but you can if you want the store to immediately start managing state
  and never clean it up.

  ### Overload 2
  `adapt([path, initialState], adapter)`

  The adapter is an object such as one created by {@link createAdapter}. It contains methods for updating state,
  called "state changes" or "reactions", and optionally selectors for reading the state. Every reaction function becomes a method on
  the store object, and every selector becomes an observable on the store object.

  #### Example: Inlined adapter

  ```tsx
  const name = adapt(['name', 'John'], {
    concat: (state, payload: string) => state + payload,
    selectors: {
      length: state => state.length,
    },
  });
  name.state$.subscribe(console.log);
  name.length$.subscribe(console.log);
  name.concat('sh'); // logs 'Johnsh' and 6
  name.reset(); // logs 'John' and 4
  ```

  ### Overload 3
  `adapt([path, initialState], sources)`

  Sources allow the store to react to external events. There are 3 possible ways sources can be defined:

  1. A source can be a single {@link Source} or [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>. When the source emits, it triggers the store's `set` method
  with the payload.

  #### Example: Single source

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');

  const name = adapt(['name', 'John'], nameChange$);

  name.state$.subscribe(console.log);
  nameChange$.next('Johnsh'); // logs 'Johnsh'
  ```

  2. A source can be an array of {@link Source} or [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>. When any of the sources emit, it triggers the store's `set`
   method with the payload.

  #### Example: Array of sources

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');
  const nameChange2$ = new Source<string>('nameChange2$');

  const name = adapt(['name', 'John'], [nameChange$, nameChange2$]);

  name.state$.subscribe(console.log);
  nameChange$.next('Johnsh'); // logs 'Johnsh'
  nameChange2$.next('Johnsh2'); // logs 'Johnsh2'
  ```

  3. A source can be an object with keys that match the names of the store's reactions, with a corresponding source or array of
  sources that trigger the store's reaction with the payload.

  #### Example: Object of sources

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');
  const nameReset$ = new Source<void>('nameReset$');

  const name = adapt(['name', 'John'], {
    set: nameChange$,
    reset: [nameReset$], // Can be array of sources too
  });

  name.state$.subscribe(console.log);
  nameChange$.next('Johnsh'); // logs 'Johnsh'
  nameReset$.next(); // logs 'John'
  ```

  Each selector's observable chains off of all the sources passed into the store. For example, if one of your sources
  is an observable of an HTTP request, that request will automatically be triggered as soon as you subscribe to any of
  the selector observables from the store. If necessary, you can access store selectors that do not chain off of any
  sources by using the {@link StateAdapt.watch} function.

  ### Overload 4
  `adapt([path, initialState, adapter], sources)`

  The adapter and sources can be combined in the same overload.

  #### Example: Adapter and sources

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');
  const nameConcat$ = new Source<string>('nameConcat$');

  const nameAdapter = createAdapter<string>()({
    concat: (state, payload: string) => state + payload,
  });

  const name = adapt(['name', 'John', nameAdapter], {
    set: nameChange$,
    concat: nameConcat$,
  });

  name.state$.subscribe(console.log);
  nameChange$.next('Johnsh'); // logs 'Johnsh'
  nameConcat$.next('sh'); // logs 'Johnshsh' // Example suggested by Copilot :)
  ```

  ### Remember!

  The store needs to have subscribers in order to start managing state.
  */
  // adapt(path, initialState)
  adapt<State>(
    path: string,
    initialState: State,
  ): SmartStore<State, WithGetState<State>> &
    SyntheticSources<InitializedReactions<State>>;

  // adapt([path, initialState], adapter)
  adapt<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    [path, initialState]: [string, State],
    adapter: R & { selectors?: S },
  ): SmartStore<State, S & WithGetState<State>> &
    SyntheticSources<InitializedReactions<State, S, R>>;

  // adapt([path, initialState], sources);
  adapt<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    [path, initialState]: [string, State],
    sources:
      | Sources<State, S, InitializedReactions<State, S, R>>
      | Observable<Action<State>>
      | Observable<Action<State>>[],
  ): SmartStore<State, S & WithGetState<State>> &
    SyntheticSources<InitializedReactions<State, S, R>>;

  // adapt([path, initialState, adapter], sources);
  adapt<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    [path, initialState, adapter]: [string, State, R & { selectors?: S }],
    sources:
      | Sources<State, S, InitializedReactions<State, S, R>>
      | Observable<Action<State>>
      | Observable<Action<State>>[],
  ): SmartStore<State, S & WithGetState<State>> &
    SyntheticSources<InitializedReactions<State, S, R>>;

  // 1. adapt(path, initialState)
  // 2. adapt([path, initialState], sources)
  // 3. adapt([path, initialState], adapter)
  // 4. adapt([path, initialState, adapter], sources);
  adapt<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    first:
      | string
      | readonly [string, State]
      | readonly [string, State, R & { selectors?: S }] = '_',
    second:
      | State
      | (R & { selectors?: S })
      | Sources<State, S, R>
      | Observable<Action<State>>
      | Observable<Action<State>>[],
    third?:
      | (R & { selectors?: S })
      | Sources<State, S, R>
      | Observable<Action<State>>
      | Observable<Action<State>>[],
    fourth?:
      | Sources<State, S, R>
      | Observable<Action<State>>
      | Observable<Action<State>>[],
  ): SmartStore<State, S & WithGetState<State>> & SyntheticSources<R> {
    const arrayLength = Array.isArray(first) ? first.length : 0;

    let path;
    let initialState;
    let adapter;
    let sources;

    if (!arrayLength) {
      path = first;
      initialState = second;
      const thirdIsSource = isSource(third);
      adapter = thirdIsSource ? undefined : third;
      sources = thirdIsSource ? third : fourth;
    }

    if (arrayLength === 2) {
      path = first[0];
      initialState = first[1];
      const secondIsSources =
        isSource(second) || isSource(Object.values(second || {})[0]);
      adapter = !secondIsSources ? second : undefined;
      sources = secondIsSources ? second : third;
    }

    if (arrayLength === 3) {
      path = first[0];
      initialState = first[1];
      adapter = first[2];
      sources = second;
    }

    path = path as string;
    initialState = initialState as State;
    adapter = adapter
      ? createAdapter<State>()(adapter as R & { selectors?: S })
      : createAdapter<State>()({});
    (adapter as any).noop = createNoopReaction();
    if (
      !(adapter as any).update &&
      typeof initialState === 'object' &&
      !Array.isArray(initialState) &&
      initialState !== null
    ) {
      (adapter as any).update = createUpdateReaction();
    }
    const sourcesDefined = sources || ({} as any);
    sources = isSource(sourcesDefined) // Single source or array
      ? { set: sourcesDefined }
      : sourcesDefined;
    sources = sources as Sources<State, S, R & BasicAdapterMethods<State>>;

    // Parameters are all defined

    const pathObj = this.parsePath(path);
    const [requireSources$, syntheticSources] = this.getRequireSources<
      State,
      S,
      R,
      SyntheticSources<R>
    >(adapter as any, pathObj, sources, initialState);

    const getSelectorsCache = this.getSelectorsCacheFactory(path);
    const getState = this.getStateSelector<State>(pathObj.pathAr);
    const getStateSelector = getMemoizedSelector(path, getState, () =>
      this.getGlobalSelectorsCache(),
    ); // all state selectors go in global cache
    const { fullSelectors, selections, selectors } = this.getSelections<State, S>(
      adapter.selectors as S,
      getStateSelector as (state: any) => State,
      requireSources$,
      getSelectorsCache,
    );

    return {
      ...syntheticSources,
      ...selections,
      __: {
        requireSources$,
        selectors,
        fullSelectors,
        initialState, // added for React integration, which requires immediate access to initial state before subscribing
        select: (sel: any) => filterDefined(this.commonStore.select(sel)),
      },
    };
  }

  /**
   ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `StateAdapt.watch`

   > Copilot tip: Copy examples into your file or click to definition to open file with context for better Copilot suggestions.

  `watch` returns a detached store (doesn't chain off of sources). This allows you to watch state without affecting anything.
  It takes 2 arguments: The path of the state you are interested in, and the adapter containing the selectors you want to use.

  ```tsx
  watch(path, adapter)
  ```

  path — Object path in Redux Devtools

  adapter — Object with state change functions and selectors

  ### Usage

  `watch` is useful in 2 situations primarily: Accessing state without subscribing and accessing state for a source.

  ### Accessing state without subscribing

  `watch` enables accessing state without subscribing to sources. For example, if your adapter manages the loading state
  for an HTTP request and you need to know if the request is loading before the user is interested in the data,
  `watch` can give you access to it without triggering the request.

  #### Example: Accessing loading state

  ```tsx
  watch('data', httpAdapter).loading$.subscribe(console.log);
  ```

  ### Accessing state for a source

  It would be impossible for a source itself to access state from the store without `watch` because
  it would require using the store before it had been defined. The solution is to use `watch`
  to access the state needed by `dataReceived$`:

  #### Example: Accessing state for a source

  ```tsx
  const path = 'data'; // Make sure the same path is used in both places

  const dataReceived$ = watch(path, dataAdapter).dataNeeded$.pipe(
    filter(needed => needed),
    switchMap(() => dataService.fetchData()),
    toSource('dataReceived$'),
  );

  const dataStore = adapt([path, initialState, dataAdapter], {
    receive: dataReceived$,
  });
  ```

   */
  watch<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    path: string,
    adapter: Adapter<State, S, R & BasicAdapterMethods<State>>,
    //
  ): SmartStore<State, S & WithGetState<State>> {
    const adapterSelectors = adapter.selectors || ({} as S);
    const getSelectorsCache = this.getSelectorsCacheFactory(path);
    const getState = this.getStateSelector<State>(path.split('.'));
    const getStateSelector = getMemoizedSelector(path, getState, () =>
      this.getGlobalSelectorsCache(),
    ); // all state selectors go in global cache
    const requireSources$ = of(null);
    const { fullSelectors, selections, selectors } = this.getSelections<State, S>(
      adapterSelectors,
      getStateSelector as (state: any) => State,
      requireSources$,
      getSelectorsCache,
    );
    return {
      ...selections,
      __: {
        requireSources$: requireSources$,
        fullSelectors: fullSelectors,
        selectors,
        initialState: undefined as unknown as State, // added for React integration, which requires immediate access to initial state before subscribing,
        select: (sel: any) => filterDefined(this.commonStore.select(sel)),
      },
    };
  }

  private parsePath(path: string): ParsedPath {
    return { path, pathAr: path.split('.') };
  }

  private getRequireSources<
    State,
    S extends Selectors<State>,
    R extends ReactionsWithSelectors<State, S>,
    RSS extends SyntheticSources<R>,
  >(
    reactions: Reactions<State>,
    { path, pathAr }: ParsedPath,
    sources: Sources<State, S, R>,
    initialState: State,
  ): [Observable<any>, RSS] {
    const reactionEntries = Object.entries(reactions);
    const allSourcesWithReactions = flatten(
      reactionEntries
        .filter(([name]) => name !== 'selectors')
        .map(([reactionName, reaction]) => {
          const reactionSource = sources[reactionName] || [];
          const reactionSources = Array.isArray(reactionSource)
            ? reactionSource
            : [reactionSource];
          return reactionSources.map(source$ => ({ source$, reaction }));
        }),
    );

    const allUpdatesFromSources$ = allSourcesWithReactions.map(
      ({ source$, reaction }, i) => {
        // Source-grouped updates:
        return defer(() => {
          const updaterStream = this.getSourceUpdateStream(source$);
          const requireSources$ = updaterStream
            ? updaterStream.requireSources$
            : source$.pipe(
                tap(action => {
                  const updates = this.getAllSourceUpdates(source$, action);
                  this.commonStore.dispatch(createPatchState(action, updates));
                }),
                finalize(() => {
                  this.updaterStreams.splice(
                    this.updaterStreams.findIndex(
                      ({ source$: updaterSource$ }) => source$ === updaterSource$,
                    ),
                    1,
                  );
                }),
                share(),
              );
          if (!updaterStream) {
            this.updaterStreams.push({
              source$,
              requireSources$,
              reactions: [],
            });
          }
          // Now there is definitely an update stream for this source, so push this reaction onto it
          const updateStream = this.getSourceUpdateStream(source$);
          updateStream?.reactions.push({ path, reaction });
          return requireSources$;
        }).pipe(share());
      },
    );

    const requireSources$ = defer(() => {
      // Runs first upon subscription.
      // If any of the sources emits immediately, this needs to have been set up first.
      const colllisionPath = this.getPathCollisions(path);
      if (colllisionPath) {
        throw this.getPathCollisionError(path, colllisionPath);
      }
      const selectorsCache = this.createSelectorsCache(path);
      this.commonStore.dispatch(createInit(path, initialState));
      this.pathStates[path] = {
        lastState: initialState,
        initialState,
        arr: pathAr,
        selectorsCache,
      };
      return merge(...allUpdatesFromSources$, NEVER); // If sources all complete, keep state in the store
    }).pipe(
      finalize(() => {
        // Runs Last to clean up the store:
        allSourcesWithReactions.forEach(({ source$ }) => {
          const updateStream = this.getSourceUpdateStream(source$);
          const updateReactions = updateStream?.reactions || [];
          updateReactions.splice(
            updateReactions.findIndex(({ path: reactionPath }) => reactionPath === path),
            1,
          );
        });
        delete this.pathStates[path];
        this.destroySelectorsCache(path);
        this.commonStore.dispatch(createDestroy(path));
      }),
      share(),
    );

    const syntheticSources = reactionEntries.reduce((acc, [reactionName, reaction]) => {
      return {
        ...acc,
        [reactionName]: (payload: any) => {
          const update = this.getUpdate(path, reaction, payload);
          const action = getAction(`[${pathAr.join('] [')}] ${reactionName}`, payload);
          this.commonStore.dispatch(createPatchState(action, [update]));
        },
      };
    }, {} as RSS);

    return [requireSources$, syntheticSources];
  }

  private getPathCollisions(path: string) {
    return Object.keys(this.pathStates).find(
      existingPath =>
        path === existingPath ||
        existingPath + '.' === path.substr(0, existingPath.length + 1) ||
        path + '.' === existingPath.substr(0, path.length + 1),
    );
  }

  private getPathCollisionError(path: string, existingPath: string) {
    return new Error(
      `Path '${path}' collides with '${existingPath}', which has already been initialized as a state path.`,
    );
  }

  private getSourceUpdateStream(searchSource$: Observable<Action<any>>) {
    return this.updaterStreams.find(
      ({ source$ }) => searchSource$ === source$,
    ) as UpdaterStream;
  }

  private getAllSourceUpdates(
    source$: Observable<Action<any>>,
    { payload }: Action<any>,
  ): [string[], any][] {
    return this.getSourceUpdateStream(source$).reactions.map(({ path, reaction }) =>
      this.getUpdate(path, reaction, payload),
    );
  }

  private getUpdate(
    path: string,
    reaction: (...args: any[]) => any,
    payload: any,
  ): [string[], any] {
    const pathState = this.pathStates[path];
    if (pathState === undefined) {
      throw `Cannot apply update before store "${path}" is initialized.`;
    }
    const { lastState, initialState, arr, selectorsCache } = pathState;
    const newState = reaction(lastState, payload, initialState, selectorsCache);
    pathState.lastState = newState;
    return [arr, newState];
  }

  private getStateSelector<State>(
    pathAr: string[],
  ): ({ adapt }: { adapt: any }) => State {
    return ({ adapt }) =>
      pathAr.reduce((state, segment) => state && state[segment], adapt);
  }

  private getGlobalSelectorsCache() {
    return globalSelectorsCache;
  }

  private getSelectorsCacheFactory(path: string) {
    return () => globalSelectorsCache.__children[path];
  }

  private createSelectorsCache(path: string) {
    return (globalSelectorsCache.__children[path] = createSelectorsCache());
  }

  private destroySelectorsCache(path: string) {
    delete globalSelectorsCache.__children[path];
  }

  private getSelections<State, S extends Selectors<State>>(
    selectors: S,
    getStateSelector: (state: any) => State, // uses global cache
    requireSources$: Observable<any>,
    getSelectorsCache: () => SelectorsCache,
  ): {
    fullSelectors: S & { state: () => State };
    selectors: S & { state: () => State };
    selections: Selections<State, S>;
  } {
    const getUsing = <T>(selection$: Observable<T>) =>
      using(
        () => requireSources$.subscribe(),
        () => filterDefined(selection$),
      );

    const selections = {
      fullSelectors: { state: getStateSelector },
      selections: {
        state$: getUsing(this.commonStore.select(getStateSelector)),
      },
      selectors: { state: (pathState: any) => pathState },
    } as {
      fullSelectors: S & { state: () => State };
      selections: Selections<State, S>;
      selectors: S & { state: () => State };
    };
    for (const key in selectors) {
      const fullSelector = (state: any, sharedChildCache: SelectorsCache) => {
        const pathState = getStateSelector(state);
        if (pathState !== undefined) {
          const cache = getSelectorsCache();
          if (sharedChildCache) {
            cache.__children[sharedChildCache.__id] = sharedChildCache;
          }
          return (selectors[key] as any)(pathState, cache);
        }
      };

      (selections as any).selectors[key] = (pathState: any) =>
        (selectors[key] as any)(pathState, getSelectorsCache());
      (selections.fullSelectors as any)[key] = fullSelector;
      (selections.selections as any)[key + '$'] = getUsing(
        this.commonStore.select(fullSelector),
      );
    }

    return selections;
  }
}
