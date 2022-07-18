import { Reaction } from './reaction.type';

export interface Reactions<State> {
  [index: string]: Reaction<State>;
}
