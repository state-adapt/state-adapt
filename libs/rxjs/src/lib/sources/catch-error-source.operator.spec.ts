import { catchErrorSource } from '@state-adapt/rxjs';
import { TestScheduler } from 'rxjs/testing';
import { getAction } from '@state-adapt/core';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

const observableMatcher = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

const typePrefix = 'obs';
const type = `${typePrefix}.error$`;
const catchErrorSourceOp = catchErrorSource(typePrefix);

describe('catchErrorSource()', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should pass regular values as is', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const values = {
        a: 1,
        b: 2,
        c: 3,
      };
      const source = hot('-ab-(c|)', values).pipe(catchErrorSourceOp);
      const result = '-ab-(c|)';
      expectObservable(source).toBe(result, values);
    });
  });

  it('should catch errors and transform them into actions', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const values = {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        x: 101,
        y: 102,
      };
      const throwIfGraterThan100 = (value: number) => {
        if (value > 100) {
          throw `e${value - 100}`;
        } else {
          return value;
        }
      };
      const source = hot('abxcyd', values).pipe(
        switchMap(a => of(a).pipe(map(throwIfGraterThan100), catchErrorSourceOp)),
      );
      const result = 'abxcyd';
      const resultValues = {
        ...values,
        x: getAction(type, 'e1'),
        y: getAction(type, 'e2'),
      };
      expectObservable(source).toBe(result, resultValues);
    });
  });
});
