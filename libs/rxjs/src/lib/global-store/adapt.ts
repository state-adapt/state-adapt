import { Action, createNoopReaction, createUpdateReaction } from '@state-adapt/core';
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
  WithUpdateReaction,
  WithNoopReaction,
} from '@state-adapt/core';
import { defer, merge, NEVER, Observable, of, using } from 'rxjs';
import { distinctUntilChanged, filter, finalize, share, tap } from 'rxjs/operators';
import { isSource } from '../sources/is-source.function';
import { Selections } from '../stores/selections.type';
import { SmartStore } from '../stores/smart-store.interface';
import { Sources } from '../stores/sources.type';

interface ParsedPath {
  path: string;
  pathAr: string[];
}

const filterDefined = <T>(sel$: Observable<T>) =>
  sel$.pipe(
    filter(a => a !== undefined),
    distinctUntilChanged(),
  );

interface StoreMethods {
  select: (sel: any) => Observable<any>;
  dispatch: (action: any) => any;
}

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

type InitializedReactions<
  State,
  S extends Selectors<State> = {},
  R extends ReactionsWithSelectors<State, S> = {},
> = R &
  BasicAdapterMethods<State> &
  (State extends object ? WithUpdateReaction<State> : {}) &
  WithNoopReaction<State>;

  private pathStates: PathStates = {};
  private updaterStreams: UpdaterStream[] = [];

  constructor(private commonStore: CommonStore) {}

  /**
   * Overloads:
   * ```javascript
   * init(path, initialState)
   * init([path, initialState], adapter)
   * init([path, initialState], sources)
   * init([path, initialState, adapter], sources)
   * ```
   * @param path - Object path in Redux Devtools
   * @param initialState - Initial state of the store when it gets initialized with a subscription to its state
   * @param adapter Object with state change functions and selectors
   * @param sources Single source or array of sources for `set` state change, or object specifying sources for state change functions
   */
  // init(path, initialState)
  init<State>(
    path: string,
    initialState: State,
  ): SmartStore<State, WithGetState<State>> &
    SyntheticSources<InitializedReactions<State>>;

  // init([path, initialState], adapter)
  init<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    [path, initialState]: [string, State],
    adapter: R & { selectors?: S },
  ): SmartStore<State, S & WithGetState<State>> &
    SyntheticSources<InitializedReactions<State, S, R>>;

  // init([path, initialState], sources);
  init<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    [path, initialState]: [string, State],
    sources:
      | Sources<State, S, R>
      | Observable<Action<State>>
      | Observable<Action<State>>[],
  ): SmartStore<State, S & WithGetState<State>> &
    SyntheticSources<InitializedReactions<State, S, R>>;

  // init([path, initialState, adapter], sources);
  init<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    [path, initialState, adapter]: [string, State, R & { selectors?: S }],
    sources:
      | Sources<State, S, R>
      | Observable<Action<State>>
      | Observable<Action<State>>[],
  ): SmartStore<State, S & WithGetState<State>> &
    SyntheticSources<InitializedReactions<State, S, R>>;

  // 1. init(path, initialState)
  // 2. init([path, initialState], sources)
  // 3. init([path, initialState], adapter)
  // 4. init([path, initialState, adapter], sources);
  init<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
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
    const { fullSelectors, selections } = this.getSelections<State, S>(
      adapter.selectors as S,
      getStateSelector as (state: any) => State,
      requireSources$,
      getSelectorsCache,
    );

    return {
      ...syntheticSources,
      ...selections,
      __: {
        requireSources$: requireSources$,
        fullSelectors: fullSelectors,
        select: (sel: any) => filterDefined(this.commonStore.select(sel)),
      },
    };
  }

  /**
   * Returns a detached store (doesn't chain off of sources).
   * Path must be correct.
   */
  watch<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    path: string,
    adapter: Adapter<State, S, R & BasicAdapterMethods<State>>,
    //
  ): SmartStore<State, S & WithGetState<State>> {
    const selectors = adapter.selectors || ({} as S);
    const getSelectorsCache = this.getSelectorsCacheFactory(path);
    const getState = this.getStateSelector<State>(path.split('.'));
    const getStateSelector = getMemoizedSelector(path, getState, () =>
      this.getGlobalSelectorsCache(),
    ); // all state selectors go in global cache
    const requireSources$ = of(null);
    const { fullSelectors, selections } = this.getSelections<State, S>(
      selectors,
      getStateSelector as (state: any) => State,
      requireSources$,
      getSelectorsCache,
    );
    return {
      ...selections,
      __: {
        requireSources$: requireSources$,
        fullSelectors: fullSelectors,
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
    } as {
      fullSelectors: S & { state: () => State };
      selections: Selections<State, S>;
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

      (selections.fullSelectors as any)[key] = fullSelector;
      (selections.selections as any)[key + '$'] = getUsing(
        this.commonStore.select(fullSelector),
      );
    }

    return selections;
  }
}
