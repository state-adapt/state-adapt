// import { Reactions } from './reactions.interface';
import { Selectors } from './selectors.interface';

export interface ReactionsWithSelectors<State, S extends Selectors<State>> {
  [index: string]:
    | ((state: State, event: any, initialState: State) => State)
    | S;
}

export type Adapter<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>
> = R & {
  selectors?: S;
};
