import { createSelector } from 'reselect';
import { defer, isObservable, merge, NEVER, Observable, of, using } from 'rxjs';
import { distinctUntilChanged, filter, finalize, share, tap } from 'rxjs/operators';
import type { Action } from '../actions/action.interface';
import { getAction } from '../actions/get-action.function';
import { Adapter, ReactionsWithSelectors } from '../adapters/adapter.type';
import { BasicAdapterMethods, createAdapter } from '../adapters/create-adapter.function';
import { Reactions } from '../adapters/reactions.interface';
import { SyntheticSources } from '../adapters/synthetic-sources.type';
import {
  createDestroy,
  createInit,
  createPatchState,
} from '../global-store/adapt.actions';
import { Selections } from '../selectors/selections.type';
import { Selectors } from '../selectors/selectors.interface';
import { WithGetState } from '../selectors/with-get-state.type';
import { MiniStore } from '../stores/mini-store.interface';
import { Sources } from '../stores/sources.type';
import { flatten } from '../utils/flatten.function';

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

export class AdaptCommon<CommonStore extends StoreMethods = any> {
  private pathStates: PathStates = {};
  private updaterStreams: UpdaterStream[] = [];

  constructor(private commonStore: CommonStore) {}

  /**
   * Overloads:
   * ```javascript
   * init(path, initialState)
   * init(path, initialState, setterSource$)
   * init(path, initialState, adapter)
   * init([path, initialState], adapter)
   * init(path, initialState, adapter, setterSource$ or sources)
   * init([path, initialState, adapter], setterSource$ or sources)
   * ```
   * @param path - Object path in Redux Devtools
   * @param initialState - Initial state of the store when it gets initialized with a subscription to its state
   * @param setterSource$ Single source (or array of sources) for `set` state change
   * @param adapter Object with state change functions and selectors
   * @param sources Object specifying sources for state change functions
   */
  // init(path, initialState)
  init<State>(
    path: string,
    initialState: State,
  ): MiniStore<State, WithGetState<State>> & SyntheticSources<BasicAdapterMethods<State>>;

  // init(path, initialState, setterSource$)
  init<State>(
    path: string,
    initialState: State,
    setterSource$: Observable<Action<State>> | Observable<Action<State>>[],
  ): MiniStore<State, WithGetState<State>> & SyntheticSources<BasicAdapterMethods<State>>;

  // init(path, initialState, adapter)
  init<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    path: string,
    initialState: State,
    adapter: R & { selectors?: S },
  ): MiniStore<State, S & WithGetState<State>> &
    SyntheticSources<R & BasicAdapterMethods<State>>;

  // init([path, initialState], adapter)
  init<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    [path, initialState]: [string, State],
    adapter: R & { selectors?: S },
  ): MiniStore<State, S & WithGetState<State>> &
    SyntheticSources<R & BasicAdapterMethods<State>>;

  // init(path, initialState, adapter, sources)
  init<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    path: string,
    initialState: State,
    adapter: R & { selectors?: S },
    sources:
      | Sources<State, S, R>
      | Observable<Action<State>>
      | Observable<Action<State>>[],
  ): MiniStore<State, S & WithGetState<State>> &
    SyntheticSources<R & BasicAdapterMethods<State>>;

  // init([path, initialState, adapter], sources);
  init<State, S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    [path, initialState, adapter]: [string, State, R & { selectors?: S }],
    sources:
      | Sources<State, S, R>
      | Observable<Action<State>>
      | Observable<Action<State>>[],
  ): MiniStore<State, S & WithGetState<State>> &
    SyntheticSources<R & BasicAdapterMethods<State>>;

  // 1. init(path, initialState)
  // 2. init(path, initialState, setterSource$)
  // 3. init(path, initialState, adapter)
  // 4. init([path, initialState], adapter)
  // 5. init(path, initialState, adapter, sources)
  // 6. init([path, initialState, adapter], sources);
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
  ): MiniStore<State, S & WithGetState<State>> & SyntheticSources<R> {
    const arrayLength = Array.isArray(first) ? first.length : 0;

    let path;
    let initialState;
    let adapter;
    let sources;

    if (!arrayLength) {
      path = first;
      initialState = second;
      const thirdIsSource = Array.isArray(third) || isObservable(third);
      adapter = thirdIsSource ? undefined : third;
      sources = thirdIsSource ? third : fourth;
    }

    if (arrayLength === 2) {
      path = first[0];
      initialState = first[1];
      adapter = second;
      sources = third;
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
      : createAdapter<State>()();
    const sourcesDefined = sources || ({} as any);
    sources =
      Array.isArray(sourcesDefined) || isObservable(sourcesDefined)
        ? { set: sourcesDefined }
        : sourcesDefined;
    sources = sources as Sources<State, S, R & BasicAdapterMethods<State>>;

    // Parameters are all defined

    const pathObj = this.parsePath(path);
    const selectors = (adapter.selectors || {}) as S;
    const reactions = { ...adapter } as Reactions<State>;
    delete reactions.selectors;
    const [requireSources$, syntheticSources] = this.getRequireSources<
      State,
      S,
      R,
      SyntheticSources<R>
    >(reactions, pathObj, sources, initialState);

    const getState = this.getStateSelector<State>(pathObj.pathAr);
    const { fullSelectors, selections } = this.getSelections<State, S>(
      selectors,
      getState,
      requireSources$,
    );

    return {
      ...syntheticSources,
      ...selections,
      _requireSources$: requireSources$,
      _fullSelectors: fullSelectors,
      _select: (sel: any) => filterDefined(this.commonStore.select(sel)),
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
  ): MiniStore<State, S & WithGetState<State>> {
    const selectors = adapter.selectors || ({} as S);
    const getState = this.getStateSelector<State>(path.split('.'));
    const requireSources$ = of(null);
    const { fullSelectors, selections } = this.getSelections<State, S>(
      selectors,
      getState,
      requireSources$,
    );
    return {
      ...selections,
      _requireSources$: requireSources$,
      _fullSelectors: fullSelectors,
      _select: (sel: any) => filterDefined(this.commonStore.select(sel)),
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
      reactionEntries.map(([reactionName, reaction]) => {
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
      this.commonStore.dispatch(createInit(path, initialState));
      this.pathStates[path] = {
        lastState: initialState,
        initialState,
        arr: pathAr,
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
    const { lastState, initialState, arr } = pathState;
    const newState = reaction(lastState, payload, initialState);
    pathState.lastState = newState;
    return [arr, newState];
  }

  private getStateSelector<State>(
    pathAr: string[],
  ): ({ adapt }: { adapt: any }) => State {
    return ({ adapt }) =>
      pathAr.reduce((state, segment) => state && state[segment], adapt);
  }

  private getSelections<State, S extends Selectors<State>>(
    selectors: S,
    getState: ({ adapt }: { adapt: any }) => State,
    requireSources$: Observable<any>,
  ): {
    fullSelectors: S & { state: () => State };
    selections: Selections<State, S>;
  } {
    const getUsing = <T>(selection$: Observable<T>) =>
      using(
        () => requireSources$.subscribe(),
        () => filterDefined(selection$),
      );
    const selections: {
      fullSelectors: S & { state: () => State };
      selections: Selections<State, S>;
    } = Object.keys(selectors).reduce(
      (selected, key) => {
        const fullSelector = createSelector([getState], (state: State) =>
          state !== undefined ? selectors[key](state) : state,
        );
        return {
          fullSelectors: { ...selected.fullSelectors, [key]: fullSelector },
          selections: {
            ...selected.selections,
            [key + '$']: getUsing(this.commonStore.select(fullSelector)),
          },
        };
      },
      {
        fullSelectors: { state: getState },
        selections: {
          state$: getUsing(this.commonStore.select(getState)),
        },
      } as {
        fullSelectors: S & { state: () => State };
        selections: Selections<State, S>;
      },
    );

    return selections;
  }
}
