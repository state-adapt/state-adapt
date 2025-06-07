import { Action, getAction } from '@state-adapt/core';
import { from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActionMap, splitSources } from './split-sources.function';

describe('splitSources', () => {
  it('should handle all types of actions', () => {
    type MyActions =
      | Action<string, 'five$'>
      | { type: 'even$' | 'odd$'; payload: number }
      | Action<void, 'random'>
      | { type: 'food$' };

    type Result = ActionMap<MyActions>;

    const result: Result = {
      five$: of(getAction('five$', 'asdf0')),
      even$: of(getAction('even$', 0)),
      odd$: of(getAction('odd$', 1)),
      random: of(getAction('random')),
      food$: of(getAction('food$')),
    };

    const checkTypes = () => {
      // @ts-expect-error: payload type must be matched
      result.five$ = of(getAction('five$', 0));
      // @ts-expect-error: payload type must be matched
      result.even$ = of(getAction('even$', '0'));
      // @ts-expect-error: payload type must be matched
      result.random = of(getAction('random', 123));
    };

    expect(result).toBeTruthy();
  });

  const setup = () => {
    const getSource = () =>
      from([0, 1, 2, 3, 4, 5, 6]).pipe(
        map(n =>
          n % 5 === 0
            ? getAction('five$', 'asdf' + 5)
            : {
                type: n % 2 === 0 ? ('even$' as const) : ('odd$' as const),
                payload: n,
              },
        ),
      );
    const expectedResults = [
      getAction('five$', 'asdf5'),
      getAction('odd$', 1),
      getAction('even$', 2),
      getAction('odd$', 3),
      getAction('even$', 4),
      getAction('five$', 'asdf5'),
      getAction('even$', 6),
    ];
    return {
      expectedResults,
      getExpectedResults: (idxs: number[]) => idxs.map(i => expectedResults[i]),
      getSource,
      getSplitSources: () =>
        splitSources(getSource(), {
          even$: 'even$',
          odd$: 'odd$',
          fivez$: 'five$',
        }),
    };
  };

  it('should split even$', () => {
    const { getExpectedResults, getSplitSources } = setup();
    const { even$ } = getSplitSources();

    const results = [] as any[];
    even$.subscribe(v => results.push(v));
    const expectedResults = getExpectedResults([2, 4, 6]);
    expect(results).toEqual(expectedResults);
  });

  it('should split odd$', () => {
    const { getExpectedResults, getSplitSources } = setup();
    const { odd$ } = getSplitSources();

    const results = [] as any[];
    odd$.subscribe(v => results.push(v));
    const expectedResults = getExpectedResults([1, 3]);
    expect(results).toEqual(expectedResults);
  });

  it('should split five$', () => {
    const { getExpectedResults, getSplitSources } = setup();
    const { five$ } = getSplitSources();

    const results = [] as any[];
    five$.subscribe(v => results.push(v));
    const expectedResults = getExpectedResults([0, 5]);
    expect(results).toEqual(expectedResults);
  });

  it('should split fivez$', () => {
    const { getExpectedResults, getSplitSources } = setup();
    const { fivez$ } = getSplitSources();

    const results = [] as any[];
    fivez$.subscribe(v => results.push(v));
    const expectedResults = getExpectedResults([0, 5]);
    expect(results).toEqual(expectedResults);
  });

  it('should handle unknown types', () => {
    const { getSource } = setup();

    const checkTypes = () => {
      const sources = splitSources(getSource());
      // @ts-expect-error: only access types in source observable
      sources.asdf$;
      const { even$, odd$, five$ } = sources;
    };

    expect(checkTypes).toBeTruthy();
  });
});
