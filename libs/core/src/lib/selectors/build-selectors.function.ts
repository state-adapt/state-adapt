import {
  combineSelectors,
  ReturnTypeSelectors,
  SelectorReturnTypes,
} from '../selectors/create-selectors.function';
import { Selectors } from '../selectors/selectors.interface';
import { Flat } from '../utils/flat.type';
import { memoizeSelectors, WithStateSelector } from './memoize-selectors.function';

/**
 * @deprecated Use buildAdapter
 *
 */
export function buildSelectors<State>() {
  return <S extends Selectors<State>>(
    selectors: S,
  ): NewBlockAdder<State, WithStateSelector<State, S>> => {
    return addNewBlock(memoizeSelectors<State, S>(selectors));
  };
}

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

type AddNewBlock<State, S extends Selectors<State>, D extends Prev[number] = 19> = (
  selectors: S,
) => D extends [never] ? S : NewBlockAdder<State, S, D>;

interface NewBlockAdder<State, S extends Selectors<State>, D extends Prev[number] = 19> {
  (): S;

  <NewBlock extends Selectors<SelectorReturnTypes<State, S>>>(
    newBlock: NewBlock,
  ): ReturnType<
    AddNewBlock<
      State,
      Flat<ReturnTypeSelectors<State, SelectorReturnTypes<State, S>, Flat<S & NewBlock>>>,
      Prev[D]
    >
  >;
}

function addNewBlock<S extends Selectors<any>>(
  selectors: S,
): ReturnType<AddNewBlock<any, any>> {
  return <NewS extends Selectors<any> | ((s: S) => Selectors<any>)>(newS?: NewS) =>
    newS
      ? typeof newS === 'function'
        ? (selectors as any)
        : addNewBlock(combineSelectors<any>()<any, any, any>(selectors, newS))
      : selectors;
}
