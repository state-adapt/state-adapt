import { AnySelectors } from './any-selectors.interface';

export type JoinedSelectors<AS extends AnySelectors, JoinedState> = AS & {
  getState: (state: any) => JoinedState;
};
