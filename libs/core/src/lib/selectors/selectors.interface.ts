export interface Selectors<State> {
  [index: string]: (state: State) => any;
}
