export const state = { one: 0, two: 0 };

export function mutate(): void {
  state.one = 1;
  state.two = 2;
}
