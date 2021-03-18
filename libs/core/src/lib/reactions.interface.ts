export interface Reactions<State> {
  [index: string]: (state: State, event: any, initialState: State) => State;
}
