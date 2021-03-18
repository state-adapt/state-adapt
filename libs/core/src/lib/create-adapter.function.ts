import { Adapter, ReactionsWithGetSelectors } from './adapter.type';
import { Selectors } from './selectors.interface';

export function createAdapter<State>() {
  return <
    S extends Selectors<State>,
    R extends ReactionsWithGetSelectors<State, S>
  >(
    adapter: Adapter<State, S, R>,
  ) => ({
    ...adapter,
  });
}

// interface Filter {
//   checked: boolean;
// }

// const defaultAdapter = createAdapter<Filter[]>()({
//   toggle: (state, checked: boolean) =>
//     state.map((filter) => ({ ...filter, checked })),
//   getSelectors: () => ({
//     getCheckedFilters: (filters) => filters.filter(({ checked }) => checked),
//   }),
// });

// const createFilterAdapter = <State extends Filter>() =>
//   createAdapter<State[]>()({
//     toggle: (state, checked: boolean) =>
//       state.map((filter) => ({ ...filter, checked })),
//     getSelectors: () => ({
//       getCheckedFilters: (filters) => filters.filter(({ checked }) => checked),
//     }),
//   });

// const filterAdapter = createFilterAdapter<Filter & { randomProp: string }>();
// const getCheckedFilters = filterAdapter.getSelectors().getCheckedFilters;
// const toggleFilter = filterAdapter.toggle;

// interface AsyncFilter extends Filter {
//   loaded: boolean;
// }

// const createAsyncFilterAdapter = <State extends AsyncFilter>() => {
//   const filterAdapter = createFilterAdapter<State>();
//   return createAdapter<State[]>()({
//     ...filterAdapter,
//     receiveFilters: (state, loaded: boolean) =>
//       state.map((thing) => ({ ...thing, loaded })),
//     getSelectors: () => ({
//       ...filterAdapter.getSelectors(),
//       getLoaded: (state) => state.every(({ loaded }) => loaded),
//     }),
//   });
// };

// const asyncFilterAdapter = createAsyncFilterAdapter<AsyncFilter & { randomProp: string }>();
// // const getCheckedFilters = asyncFilterAdapter.getSelectors().getCheckedFilters;
// // const toggleFilter = asyncFilterAdapter.toggle;
// const getLoaded = asyncFilterAdapter.getSelectors().getLoaded;
// const receiveFilters = asyncFilterAdapter.receiveFilters;
