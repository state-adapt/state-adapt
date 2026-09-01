import { state } from './state';

export function mutateResource(): void {
  state.value++;
}
