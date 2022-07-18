export type Reaction<State> = (state: State, event: any, initialState: State) => State;
