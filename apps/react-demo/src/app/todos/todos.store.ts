import { adapt } from '@state-adapt/react';
import { source } from '@state-adapt/rxjs';
import { initialTodosState, todosAdapter } from './todos.adapter';

export const onTodoSubmit = source<string>('[Todos] onTodoSubmit');

/**
 * Declared outside the route component so its state survives navigation. The app
 * shell subscribes to it for the nav badge, which keeps it active.
 */
export const todosStore = adapt(initialTodosState, {
  adapter: todosAdapter,
  sources: { addItems: onTodoSubmit },
  path: 'todos',
});
