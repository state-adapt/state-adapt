import { nestedState } from '../feature/state';

export function mutateNestedResource(): void {
  nestedState.value++;
}
