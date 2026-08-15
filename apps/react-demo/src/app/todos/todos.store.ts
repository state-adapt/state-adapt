import { adapt } from '../../store';
import { initialTodosState, todosAdapter } from './todos.adapter';

/**
 * Declared outside the route component so its state survives navigation. The app
 * shell subscribes to it for the nav badge, which keeps it active.
 */
export const todosStore = adapt(initialTodosState, {
  adapter: todosAdapter,
  path: 'todos',
});
