export function createNoopReaction<State>(): NoopReaction<State> {
  return (state: State) => state;
}

export type NoopReaction<State> = (s: State) => State;
export interface WithNoopReaction<State> {
  noop: NoopReaction<State>;
}
