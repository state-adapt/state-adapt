// import { Reactions } from './reactions.interface';
import { Selectors } from './selectors.interface';
import { createEntityAdapter, EntityState } from '@ngrx/entity';

export interface ReactionsWithGetSelectors<State, S extends Selectors<State>> {
  [index: string]:
    | ((state: State, event: any, initialState: State) => State)
    | (() => S);
}

export type Adapter<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithGetSelectors<State, S>
> = R & {
  getSelectors?: () => S;
};

// const entityAdapter = createEntityAdapter<{ checked: boolean }>();
// const entitySelectors = entityAdapter.getSelectors();
// entitySelectors.

// const adapterUsingEntity = createAdapter<EntityState<{ checked: boolean }>>()({
//   toggle: (state, checked: boolean) =>
//     entityAdapter.updateOne({ id: '2', changes: { checked } }, state),
//   getSelectors: () => ({
//     getCheckedFilters: (filters) => entitySelectors.selectAll(filters).filter(({ checked }) => checked),
//   }),
// });

// const defaultAdapter = createAdapter<{ checked: boolean }[]>()({
//   toggle: (state, checked: boolean) =>
//     state.map((filter) => ({ ...filter, checked })),
//   getSelectors: () => ({
//     getCheckedFilters: (filters) => filters.filter(({ checked }) => checked),
//   }),
// });
