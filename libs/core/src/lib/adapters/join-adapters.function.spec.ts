import { joinAdapters } from './join-adapters.function';
import { createAdapter } from './create-adapter.function';
import { mapPayloads } from './map-payloads.function';
import { SecondParameterOrAny } from './second-parameter-or-any.type';
import { createSelectorsCache } from '../selectors/memoize-selectors.function';

interface AState {
  prop1: number;
  prop2: string;
}
const aState: AState = {
  prop1: 1,
  prop2: '2',
};

interface BState {
  prop3: string[];
}
const bState: BState = {
  prop3: ['3'],
};

interface CState {
  prop4: number[];
}
const cState: CState = {
  prop4: [4],
};

interface DState {
  prop5: string;
}
const dState: DState = {
  prop5: 'd',
};

interface ParentState {
  a: AState;
  b: BState;
  c: CState;
  d: DState;
  extraProp: string[];
}
const parentState: ParentState = {
  a: aState,
  b: bState,
  c: cState,
  d: dState,
  extraProp: ['extraProp'],
};

const aAdapter = joinAdapters<AState>()({
  prop1: createAdapter<number>()({}),
  prop2: createAdapter<string>()({}),
})({
  oneAndTwo: s => s.prop1.toString() + s.prop2,
})(() => ({
  setProp2FromAr: (state, newProp2Ar: string[]) => ({ ...state, prop2: newProp2Ar[0] }),
}))();
const bAdapter = createAdapter<BState>()({
  setProp3: (state, newProp3Ar: string[]) => ({ ...state, prop3: newProp3Ar }),
});
const dAdapter = createAdapter<DState>()({
  toggleCaps: state => ({
    ...state,
    prop5:
      state.prop5.toLowerCase() === state.prop5
        ? state.prop5.toUpperCase()
        : state.prop5.toLowerCase(),
  }),
});
const extraPropAdapter = createAdapter<string[]>()({});
const joinedAdapters = joinAdapters<ParentState, 'extraProp' | 'c'>()({
  a: aAdapter,
  b: bAdapter,
  d: dAdapter,
})({
  changeABAndExtraProp: {
    a: aAdapter.setProp2FromAr,
    b: bAdapter.setProp3,
    extraProp: extraPropAdapter.set, // Yes, make an adapter for that specific property,
    d: dAdapter.reset, // Make sure `void` payload doesn't swallow the whole thing
  },
})({
  combinedSelector: s => s.aOneAndTwo + s.a.prop2 + s.state.c.prop4[0].toString(),
})(([, reactions]) =>
  mapPayloads(reactions, {
    setA: (p: number) => ({ prop1: p, prop2: (p * 2).toString() }),
  }),
)();

const cache = createSelectorsCache();

describe('mergeAdapters', () => {
  it("should return child adapter's state", () => {
    const bResult = joinedAdapters.selectors.b(parentState, cache);
    expect(bResult).toEqual(bState);
  });
  it("should return child adapter's selector result", () => {
    const aResult = joinedAdapters.selectors.aOneAndTwo(parentState, cache);
    expect(aResult).toBe('12');
  });
  it('should return combined selector result', () => {
    const aResult = joinedAdapters.selectors.combinedSelector(parentState, cache);
    expect(aResult).toBe('1224');
    // console.log('cache', JSON.stringify(cache, null, '\t'));
  });
  it('should set state', () => {
    const newState: ParentState = {
      a: { prop1: 10, prop2: '20' },
      b: { prop3: ['asdfasdfsadfsdfsdfdsfds'] },
      c: { prop4: [11] },
      d: { prop5: 'd' },
      extraProp: ['extraProp'],
    };
    const returnedState = joinedAdapters.set(parentState, newState);
    expect(returnedState).toEqual(newState);
  });
  it('should set child state, with mapped payload', () => {
    const newState = joinedAdapters.setA(parentState, 10, parentState);
    expect(newState).toEqual({ ...parentState, a: { prop1: 10, prop2: '20' } });
  });
  it('should update child object state', () => {
    const newState = joinedAdapters.updateA(parentState, { prop2: '3' }, parentState);
    expect(newState).toEqual({ ...parentState, a: { prop1: 1, prop2: '3' } });
    const checkTypes = () => {
      // @ts-expect-error
      joinedAdapters.updateB(parentState, { prop3: ['4'] }, parentState);
    };
  });
  it('should change multiple sub-states', () => {
    const newState = joinedAdapters.changeABAndExtraProp(
      parentState,
      ['Hello there'],
      parentState,
    );
    expect(newState).toEqual({
      ...parentState,
      a: { ...parentState.a, prop2: 'Hello there' },
      b: { ...parentState.b, prop3: ['Hello there'] },
      extraProp: ['Hello there'],
    });
  });
  it('should handle empty selectors correctly', () => {
    const newState = joinedAdapters.setD(parentState, { prop5: 'D' }, parentState);
    expect(newState).toEqual({
      ...parentState,
      d: { prop5: 'D' },
    });
  });
  it('should handle empty payloads correctly', () => {
    const newState = joinedAdapters.toggleDCaps(
      parentState,
      undefined as void,
      parentState,
    );
    expect(newState).toEqual({
      ...parentState,
      d: { prop5: 'D' },
    });
  });
  it('should reset child state correctly and expect void when called directly', () => {
    const newState = joinedAdapters.resetA(
      parentState,
      1 as unknown as void,
      parentState,
    );
    expect(newState).toEqual(parentState);
  });
  it('should enable void payload to react to any source', () => {
    const payload: SecondParameterOrAny<Parameters<typeof joinedAdapters.resetA>> =
      'asdf';
    expect(payload).toBe(payload);
  });
});

// =============================== Group state changes ==================================
describe('group state changes', () => {
  const joinedAdapters = joinAdapters<{ a: number; b: number }>()({
    a: createAdapter<number>()({}),
    b: createAdapter<number>()({}),
  })({
    increment: {
      a: n => n + 1,
      b: n => n + 1,
    },
    // decrement: {
    //   a: 'decrement',
    //   b: 'decrement',
    // }
  })();

  it('should work', () => {
    const result = joinedAdapters.increment({ a: 1, b: 2 }, undefined, { a: 1, b: 2 });
    expect(result).toEqual({ a: 2, b: 3 });
  });
});
