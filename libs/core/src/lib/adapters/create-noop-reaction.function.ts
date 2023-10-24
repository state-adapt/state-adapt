export function createNoopReaction<State>(): NoopReaction<State> {
  return (state: State) => state;
}

export type NoopReaction<State> = (s: State) => State;
export type WithNoopReaction<State> = {
  noop: NoopReaction<State>;
};
