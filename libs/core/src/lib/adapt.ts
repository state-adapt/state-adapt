import { createSelector } from '@ngrx/store';
import { flatten } from 'lodash';
import { defer, merge, NEVER, Observable, of, using } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  finalize,
  share,
  tap,
} from 'rxjs/operators';
import type { Action } from './action.interface';
import { PatchState } from './adapt.actions';
import { Adapter, ReactionsWithGetSelectors } from './adapter.type';
import { createBasicAdapter } from './create-basic-adapter.function';
import { MiniStore } from './mini-store.interface';
import { Reactions } from './reactions.interface';
import { Selections } from './selections.type';
import { Selectors } from './selectors.interface';
import { Sources } from './sources.type';

const filterDefined = <T>(sel$: Observable<T>) =>
  sel$.pipe(
    filter(a => a !== undefined),
    distinctUntilChanged(),
  );

interface StoreMethods {
  select: (sel: any) => Observable<any>;
  dispatch: (action: any) => any;
}

export class AdaptCommon<CommonStore extends StoreMethods> {
  private pathStates: {
    [index: string]: { lastState: any; initialState: any };
  } = {};
  private updaterStreams: {
    source$: Observable<Action<any>>;
    requireSources$: Observable<any>;
    reactions: {
      path: string;
      reaction: (...args: any[]) => any;
    }[];
  }[] = [];

  constructor(private commonStore: CommonStore) {}

  init<
    State,
    S extends Selectors<State>,
    R extends ReactionsWithGetSelectors<State, S>
  >(
    [path, adapter, initialState]: [string, Adapter<State, S, R>, State],
    sources: Sources<State, S, R>,
  ): MiniStore<State, S & { getState: (state: any) => State }> {
    // type S = ReturnType<R['getSelectors']>;
    const selectors = adapter.getSelectors ? adapter.getSelectors() : ({} as S);
    const reactions = { ...adapter } as Reactions<State>;
    delete reactions.getSelectors;
    const requireSources$ = this.getRequireSources<State, S, R>(
      reactions,
      path,
      sources,
      initialState,
    );

    const getState = this.getStateSelector<State>(path);
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

  initGet<
    State,
    S extends Selectors<State>,
    R extends ReactionsWithGetSelectors<State, S>
  >(
    [path, adapter, initialState]: [string, Adapter<State, S, R>, State],
    sources: Sources<State, S, R>,
  ): Observable<State> {
    const reactions = { ...adapter } as Reactions<State>;
    delete reactions.getSelectors;
    const requireSources$ = this.getRequireSources<State, S, R>(
      reactions,
      path,
      sources,
      initialState,
    );

    const getState = this.getStateSelector<State>(path);

    return using(
      () => requireSources$.subscribe(),
      () => filterDefined(this.commonStore.select(getState)),
    );
  }

  setter<State>(
    path: string,
    initialState: State,
    source$: Observable<Action<State>> | Observable<Action<State>>[],
  ) {
    return this.initGet([path, createBasicAdapter<State>(), initialState], {
      set: source$,
    });
  }
  updater<State>(
    path: string,
    initialState: State,
    source$:
      | Observable<Action<Partial<State>>>
      | Observable<Action<Partial<State>>>[],
  ) {
    return this.initGet([path, createBasicAdapter<State>(), initialState], {
      update: source$,
    });
  }

  select<
    State,
    S extends Selectors<State>,
    R extends ReactionsWithGetSelectors<State, S>
  >(
    path: string,
    adapter: Adapter<State, S, R>,
    // Returns a detached store; doesn't chain off of sources.
  ): MiniStore<State, S & { getState: (state: any) => State }> {
    const selectors = adapter.getSelectors ? adapter.getSelectors() : ({} as S);
    const getState = this.getStateSelector<State>(path);
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

  private getRequireSources<
    State,
    S extends Selectors<State>,
    R extends ReactionsWithGetSelectors<State, S>
  >(
    reactions: Reactions<State>,
    path: string,
    sources: Sources<State, S, R>,
    initialState: State,
  ): Observable<any> {
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
                  this.commonStore.dispatch(new PatchState(action, updates));
                }),
                finalize(() => {
                  this.updaterStreams.splice(
                    this.updaterStreams.findIndex(
                      ({ source$: updaterSource$ }) =>
                        source$ === updaterSource$,
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
      // Runs First. If any of the sources emits immediately, this needs to have been set up first.
      const colllisionPath = this.getPathCollisions(path);
      if (colllisionPath) {
        throw this.getPathCollisionError(path, colllisionPath);
      }
      this.commonStore.dispatch(
        new PatchState({ type: 'INIT' }, [[path.split('.'), initialState]]),
      );
      this.pathStates[path] = { lastState: initialState, initialState };
      return merge(...allUpdatesFromSources$, NEVER); // If sources all complete, keep state in the store
    }).pipe(
      finalize(() => {
        // Runs Last to clean up the store:
        allSourcesWithReactions.forEach(({ source$ }) => {
          const updateStream = this.getSourceUpdateStream(source$);
          const updateReactions = updateStream?.reactions || [];
          updateReactions.splice(
            updateReactions.findIndex(
              ({ path: reactionPath }) => reactionPath === path,
            ),
            1,
          );
        });
        delete this.pathStates[path];
        this.commonStore.dispatch(
          new PatchState({ type: 'DESTROY' }, [[path.split('.'), undefined]]),
        );
      }),
      share(),
    );

    return requireSources$;
  }

  private getSourceUpdateStream(searchSource$: Observable<Action<any>>) {
    return this.updaterStreams.find(({ source$ }) => searchSource$ === source$);
  }

  private getAllSourceUpdates(
    source$: Observable<Action<any>>,
    { payload }: Action<any>,
  ): [string[], any][] {
    return this.getSourceUpdateStream(source$).reactions.map(
      ({ path, reaction }) => {
        const pathState = this.pathStates[path];
        const { lastState, initialState } = pathState;
        const newState = reaction(lastState, payload, initialState);
        pathState.lastState = newState;
        return [path.split('.'), newState];
      },
    );
  }

  private getStateSelector<State>(path: string): ({ adapt: any }) => State {
    return ({ adapt }) =>
      path
        .split('.')
        .reduce((state, segment) => state && state[segment], adapt);
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

  private getSelections<State, S extends Selectors<State>>(
    selectors: S,
    getState: ({ adapt: any }) => State,
    requireSources$: Observable<any>,
  ): {
    fullSelectors: S & { getState: () => State };
    selections: Selections<State, S>;
  } {
    const getUsing = <T>(selection$: Observable<T>) =>
      using(
        () => requireSources$.subscribe(),
        () => filterDefined(selection$),
      );
    const selections: {
      fullSelectors: S & { getState: () => State };
      selections: Selections<State, S>;
    } = Object.keys(selectors).reduce(
      (selected, key) => {
        const fullSelector = createSelector(
          getState,
          (state: State, props: any) =>
            state !== undefined ? selectors[key](state, props) : state,
        );
        return {
          fullSelectors: { ...selected.fullSelectors, [key]: fullSelector },
          selections: {
            ...selected.selections,
            [key]: (props: any) =>
              getUsing(this.commonStore.select(fullSelector)),
          },
        };
      },
      {
        fullSelectors: { getState },
        selections: {
          getState: () => getUsing(this.commonStore.select(getState)),
        },
      } as {
        fullSelectors: S & { getState: () => State };
        selections: Selections<State, S>;
      },
    );

    return selections;
  }
}
