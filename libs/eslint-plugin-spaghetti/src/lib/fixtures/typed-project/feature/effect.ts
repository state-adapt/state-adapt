export const nestedState = { value: 0 };

export function mutateNested(): void {
  nestedState.value = 1;
}
