import { Reactions } from './reactions.interface';

export function createReactions<State>() {
  return <S extends Reactions<State>>(getReactions: () => S) => getReactions();
}
