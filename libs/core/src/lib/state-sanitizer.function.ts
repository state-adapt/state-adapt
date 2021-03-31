export function stateSanitizer<T extends { adapt: any }>(state: T): T {
  return { ...state, ...state.adapt, adapt: undefined };
}
