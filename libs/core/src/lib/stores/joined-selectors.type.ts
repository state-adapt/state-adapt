import { AnySelectors } from '../selectors/any-selectors.interface';

export type JoinedSelectors<AS extends AnySelectors, JoinedState> = AS & {
  state: (state: any) => JoinedState;
};
