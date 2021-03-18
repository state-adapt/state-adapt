import { Injectable } from '@angular/core';
import { createSelector } from '@ngrx/store';
import { Store } from '@ngxs/store';
import type { Action } from '@state-adapt/core';
import {
  PatchState,
  Adapter,
  ReactionsWithGetSelectors,
  MiniStore,
  Reactions,
  Selections,
  Selectors,
  Sources,
} from '@state-adapt/core';
import { flatten } from 'lodash';
import { defer, merge, NEVER, Observable, of, using } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  finalize,
  share,
  tap,
} from 'rxjs/operators';

const filterDefined = <T>(sel$: Observable<T>) =>
  sel$.pipe(
    filter((a) => a !== undefined),
    distinctUntilChanged()
  );

@Injectable({ providedIn: 'root' })
export class Adapt {
  pathStates: { path: string[]; lastState: any; initialState: any }[] = [];
  updaterStreams: {
    source$: Observable<Action<any>>;
    requireSources$: Observable<any>;
    reactions: {
      path: string[];
      reaction: (...args: any[]) => any;
    }[];
  }[] = [];

  constructor(private store: Store) {}

  init<
    State,
    S extends Selectors<State>,
    R extends ReactionsWithGetSelectors<State, S>
  >(
    adapter: Adapter<State, S, R>,
    path: string[],
    sources: Sources<State, S, R>,
    initialState: State
  ): MiniStore<State, S & { getState: (state: any) => State }> {
    // type S = ReturnType<R['getSelectors']>;
    const selectors = adapter.getSelectors ? adapter.getSelectors() : ({} as S);
    const reactions = { ...adapter } as Reactions<State>;
    delete reactions.getSelectors;
    const requireSources$ = this.getRequireSources<State, S, R>(
      reactions,
      path,
      sources,
      initialState
    );

    const getState = this.getStateSelector<State>(path);
    const { fullSelectors, selections } = this.getSelections<State, S>(
      selectors,
      getState,
      requireSources$
    );

    return {
      ...selections,
      _requireSources$: requireSources$,
      _fullSelectors: fullSelectors,
      _select: (sel: any) => filterDefined(this.store.select(sel)),
    };
  }

  initGet<
    State,
    S extends Selectors<State>,
    R extends ReactionsWithGetSelectors<State, S>
  >(
    adapter: Adapter<State, S, R>,
    path: string[],
    sources: Sources<State, S, R>,
    initialState: State
  ): Observable<State> {
    const reactions = { ...adapter } as Reactions<State>;
    delete reactions.getSelectors;
    const requireSources$ = this.getRequireSources<State, S, R>(
      reactions,
      path,
      sources,
      initialState
    );

    const getState = this.getStateSelector<State>(path);

    return using(
      () => requireSources$.subscribe(),
      () => filterDefined(this.store.select(getState))
    );
  }

  select<
    State,
    S extends Selectors<State>,
    R extends ReactionsWithGetSelectors<State, S>
  >(
    path: string[],
    adapter: Adapter<State, S, R>
    // Returns a detached store; doesn't chain off of sources.
  ): MiniStore<State, S & { getState: (state: any) => State }> {
    const selectors = adapter.getSelectors ? adapter.getSelectors() : ({} as S);
    const getState = this.getStateSelector<State>(path);
    const requireSources$ = of(null);
    const { fullSelectors, selections } = this.getSelections<State, S>(
      selectors,
      getState,
      requireSources$
    );
    return {
      ...selections,
      _requireSources$: requireSources$,
      _fullSelectors: fullSelectors,
      _select: (sel: any) => filterDefined(this.store.select(sel)),
    };
  }

  private getRequireSources<
    State,
    S extends Selectors<State>,
    R extends ReactionsWithGetSelectors<State, S>
  >(
    reactions: Reactions<State>,
    path: string[],
    sources: Sources<State, S, R>,
    initialState: State
  ): Observable<any> {
    const reactionEntries = Object.entries(reactions);
    const allSourcesWithReactions = flatten(
      reactionEntries.map(([reactionName, reaction]) => {
        const reactionSources = sources[reactionName] || [];
        return reactionSources.map((source$) => ({ source$, reaction }));
      })
    );

    const allUpdatesFromSources$ = allSourcesWithReactions.map(
      ({ source$, reaction }, i) => {
        // Source-grouped updates:
        return defer(() => {
          const updaterStream = this.getSourceUpdateStream(source$);
          const requireSources$ = updaterStream
            ? updaterStream.requireSources$
            : source$.pipe(
                tap((action) => {
                  const updates = this.getAllSourceUpdates(source$, action);
                  this.store.dispatch(new PatchState(action.type, updates));
                }),
                finalize(() => {
                  this.updaterStreams.splice(
                    this.updaterStreams.findIndex(
                      ({ source$: updaterSource$ }) =>
                        source$ === updaterSource$
                    ),
                    1
                  );
                }),
                share()
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
      }
    );

    const requireSources$ = defer(() => {
      // Runs First. If any of the sources emits immediately, this needs to have been set up first.
      const parentPathStates = this.getParentPathStates(path);
      if (parentPathStates.length) {
        throw this.getChildPathError(path, parentPathStates[0]);
      }
      this.store.dispatch(new PatchState('INIT', [[path, initialState]]));
      this.pathStates.push({
        path,
        lastState: initialState,
        initialState,
      });
      return merge(...allUpdatesFromSources$, NEVER); // If sources all complete, keep state in the store
    }).pipe(
      finalize(() => {
        // Runs Last to clean up the store:
        allSourcesWithReactions.forEach(({ source$ }) => {
          const updateStream = this.getSourceUpdateStream(source$);
          const updateReactions = updateStream?.reactions || [];
          updateReactions.splice(
            updateReactions.findIndex(
              ({ path: reactionPath }) =>
                reactionPath.join('.') === path.join('.')
            ),
            1
          );
        });
        this.pathStates.splice(
          this.pathStates.findIndex(
            ({ path: statePath }) => statePath.join('.') === path.join('.')
          ),
          1
        );
        this.store.dispatch(new PatchState('DESTROY', [[path, undefined]]));
      }),
      share()
    );

    return requireSources$;
  }

  private getSourceUpdateStream(searchSource$: Observable<Action<any>>) {
    return this.updaterStreams.find(({ source$ }) => searchSource$ === source$);
  }

  private getAllSourceUpdates(
    source$: Observable<Action<any>>,
    action: Action<any>
  ): [string[], any][] {
    return this.getSourceUpdateStream(source$).reactions.map(
      ({ path, reaction }) => {
        const pathState = this.pathStates.find(
          ({ path: statePath }) => statePath.join('.') === path.join('.')
        );
        const newState = reaction(
          pathState.lastState,
          action.payload,
          pathState.initialState
        );
        // Make sure child states are not wiped out. They shouldn't exist, but just in case.
        const childStates = this.pathStates
          .filter(
            ({ path: childPath }) =>
              childPath.length > path.length &&
              childPath.slice(0, path.length).join('.') === path.join('.')
          )
          .reduce(
            (acc, { path: childPath }) => ({
              ...acc,
              [childPath[path.length]]: this.store.selectSnapshot(
                this.getStateSelector(path)
              ),
            }),
            {}
          );

        const isObject =
          typeof newState === 'object' && !Array.isArray(newState);
        const payload =
          Object.keys(childStates).length && isObject
            ? { ...newState, childStates }
            : newState;
        pathState.lastState = payload;
        return [path, payload];
      }
    );
  }

  private getStateSelector<State>(path: string[]): ({ adapt: any }) => State {
    return ({ adapt }) =>
      path.reduce((state, segment) => state && state[segment], adapt);
  }

  private getParentPathStates(path: string[]) {
    return this.pathStates
      .filter(
        ({ path: parentPath }) =>
          parentPath.length <= path.length &&
          path.slice(0, parentPath.length).join('.') === parentPath.join('.')
      )
      .map(({ path: parentPath }) => parentPath);
  }

  private getChildPathError(path: string[], parentPath: string[]) {
    const str = JSON.stringify(path);
    const parentStr = JSON.stringify(parentPath);
    return new Error(
      `Path ${str} is attempting to extend path ${parentStr}, which has already been initialized as a state path.`
    );
  }

  private getSelections<State, S extends Selectors<State>>(
    selectors: S,
    getState: ({ adapt: any }) => State,
    requireSources$: Observable<any>
  ): {
    fullSelectors: S & { getState: () => State };
    selections: Selections<State, S>;
  } {
    const getUsing = <T>(selection$: Observable<T>) =>
      using(
        () => requireSources$.subscribe(),
        () => filterDefined(selection$)
      );
    const selections: {
      fullSelectors: S & { getState: () => State };
      selections: Selections<State, S>;
    } = Object.keys(selectors).reduce(
      (selected, key) => {
        const fullSelector = createSelector(
          getState,
          (state: State, props: any) =>
            state !== undefined ? selectors[key](state, props) : state
        );
        return {
          fullSelectors: { ...selected.fullSelectors, [key]: fullSelector },
          selections: {
            ...selected.selections,
            [key]: (props: any) => getUsing(this.store.select(fullSelector)), // , props // Only works with NgRx???
          },
        };
      },
      {
        fullSelectors: { getState },
        selections: { getState: () => getUsing(this.store.select(getState)) },
      } as {
        fullSelectors: S & { getState: () => State };
        selections: Selections<State, S>;
      }
    );

    return selections;
  }
}
