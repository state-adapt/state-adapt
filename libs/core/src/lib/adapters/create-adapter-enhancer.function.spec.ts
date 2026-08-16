import {
  combineSelectors,
  ReturnTypeSelectors,
  SelectorReturnTypes,
} from '../selectors/create-selectors.function';
import { SelectorsCache } from '../selectors/memoize-selectors.function';
import { Selectors } from '../selectors/selectors.interface';
import { Adapter } from './adapter.type';
import { buildAdapter } from './build-adapter.function';
import { BuiltAdapter } from './build-adapter.types';
import {
  AdapterEnhancer,
  createAdapterEnhancer,
} from './create-adapter-enhancer.function';
import { Reactions } from './reactions.interface';

type Status = 'idle' | 'pending' | 'success' | 'error';
type WithStatus<State extends object> = State & { status: Status };

type StatusReaction<State extends object, R> = R extends (
  state: any,
  ...args: infer Args
) => any
  ? (state: WithStatus<State>, ...args: Args) => WithStatus<State>
  : never;

type StatusAdapter<
  State extends object,
  S extends Selectors<State>,
  R extends Reactions<State>,
> = {
  [K in keyof R]: StatusReaction<State, R[K]>;
} & {
  setStatus: StatusReaction<State, (state: State, payload: Status) => State>;
  selectors: {
    [K in keyof S]: (
      state: WithStatus<State>,
      cache?: SelectorsCache,
    ) => ReturnType<S[K]>;
  } & {
    status: (state: WithStatus<State>) => Status;
  };
};

// A deliberately small demo: preserve status through existing reactions and add
// one reaction and selector for controlling it.
const withStatus = <
  State extends object,
  S extends Selectors<State>,
  R extends Reactions<State>,
>(): AdapterEnhancer<
  (adapter: BuiltAdapter<State, R, S>) => StatusAdapter<State, S, R>
> =>
  createAdapterEnhancer((adapter: BuiltAdapter<State, R, S>) => {
    const enhanced = {} as StatusAdapter<State, S, R>;

    for (const name in adapter) {
      if (name === 'selectors') continue;
      enhanced[name as keyof R] = ((
        state: WithStatus<State>,
        payload: unknown,
        initialState: WithStatus<State>,
        cache: SelectorsCache,
      ) => ({
        ...adapter[name](state, payload, initialState, cache),
        status: state.status,
      })) as StatusAdapter<State, S, R>[keyof R];
    }

    enhanced.setStatus = (state, status) => ({ ...state, status });
    enhanced.selectors = {
      ...Object.fromEntries(
        Object.entries(adapter.selectors).map(([name, selector]) => [
          name,
          (state: WithStatus<State>, cache?: SelectorsCache) =>
            (selector as any)(state, cache),
        ]),
      ),
      status: state => state.status,
    } as StatusAdapter<State, S, R>['selectors'];

    return enhanced;
  });

interface CounterState {
  count: number;
}

const counterAdapter = buildAdapter<CounterState>()({
  increment: state => ({ ...state, count: state.count + 1 }),
})({
  doubled: selectors => selectors.state.count * 2,
})(withStatus())({
  statusLabel: selectors => `${selectors.status}: ${selectors.doubled}`,
})();

describe('createAdapterEnhancer', () => {
  it('lets a branded adapter-to-adapter function participate in buildAdapter', () => {
    const initialState: WithStatus<CounterState> = { count: 1, status: 'idle' };
    const pendingState = counterAdapter.setStatus(initialState, 'pending');
    const incrementedState = counterAdapter.increment(pendingState);

    expect(incrementedState).toEqual({ count: 2, status: 'pending' });
    expect(counterAdapter.selectors.statusLabel(incrementedState)).toBe('pending: 4');
  });

  it('carries the enhanced state, reaction, and selector types forward', () => {
    const state: Parameters<typeof counterAdapter.setStatus>[0] = {
      count: 1,
      status: 'success',
    };
    const status: Status = counterAdapter.selectors.status(state);
    const label: string = counterAdapter.selectors.statusLabel(state);

    expect(status).toBe('success');
    expect(label).toBe('success: 2');

    // @ts-expect-error the enhancer changes the adapter's required state shape
    counterAdapter.increment({ count: 1 });
    // @ts-expect-error setStatus only accepts known state-machine statuses
    counterAdapter.setStatus(state, 'unknown');
  });
});

const _typeCheck: Adapter<
  WithStatus<CounterState>,
  typeof counterAdapter.selectors,
  typeof counterAdapter
> = counterAdapter;

// A standalone enhancer with the exact same syntax as a normal selector block.
const withSelectors = <
  State,
  S extends Selectors<State>,
  R extends Reactions<State>,
  NewS extends Selectors<SelectorReturnTypes<State, S>>,
>(
  newSelectors: NewS,
): AdapterEnhancer<
  (
    adapter: BuiltAdapter<State, R, S>,
  ) => BuiltAdapter<
    State,
    R,
    S & ReturnTypeSelectors<State, SelectorReturnTypes<State, S>, NewS>
  >
> =>
  createAdapterEnhancer(
    (
      adapter: BuiltAdapter<State, R, S>,
    ): BuiltAdapter<
      State,
      R,
      S & ReturnTypeSelectors<State, SelectorReturnTypes<State, S>, NewS>
    > =>
      ({
        ...adapter,
        selectors: combineSelectors<State>()({ ...adapter.selectors }, newSelectors),
      } as BuiltAdapter<
        State,
        R,
        S & ReturnTypeSelectors<State, SelectorReturnTypes<State, S>, NewS>
      >),
  );

const inferredEnhancerAdapter = buildAdapter<CounterState>()({
  add: (state, amount: number) => ({ count: state.count + amount }),
})({
  doubled: s => s.state.count * 2,
})(
  withSelectors({
    quadrupled: s => s.doubled * 2,
  }),
)({
  octupled: s => s.quadrupled * 2,
})(([selectors, reactions]) => ({
  addQuadrupled: state => reactions.add(state, selectors.quadrupled(state)),
}))();

describe('an adapter-aware enhancer', () => {
  it('uses inferred reactions and selectors from the adapter built so far', () => {
    const state = { count: 2 };

    expect(inferredEnhancerAdapter.selectors.quadrupled(state)).toBe(8);
    expect(inferredEnhancerAdapter.selectors.octupled(state)).toBe(16);
    expect(inferredEnhancerAdapter.addQuadrupled(state)).toEqual({ count: 10 });
  });

  it('preserves selector result, payload, and state inference', () => {
    const state: Parameters<typeof inferredEnhancerAdapter.selectors.quadrupled>[0] = {
      count: 2,
    };
    const result: CounterState = inferredEnhancerAdapter.add(state, 3);
    const quadrupled: number = inferredEnhancerAdapter.selectors.quadrupled(state);

    expect(result).toEqual({ count: 5 });
    expect(quadrupled).toBe(8);

    // @ts-expect-error add retains its number payload
    inferredEnhancerAdapter.add(state, '3');
    // @ts-expect-error enhanced selectors retain the CounterState input
    inferredEnhancerAdapter.selectors.quadrupled({ value: 2 });
  });
});
