import { Selectors } from './selectors.interface';

export function createSelectors<State>() {
  return <S extends Selectors<State>>(getSelectors: () => S) => getSelectors();
}
