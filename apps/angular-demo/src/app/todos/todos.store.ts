import { Injectable } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { source } from '@state-adapt/rxjs';
import { initialTodosState, todosAdapter } from './todos.adapter';

export const onTodoSubmit = source<string>('[Todos] onTodoSubmit');

/**
 * Held in an injection context so its state survives navigation. The app shell
 * reads it for the nav badge, which keeps it active.
 */
@Injectable({ providedIn: 'root' })
export class TodosStores {
  todos = adapt(initialTodosState, {
    adapter: todosAdapter,
    sources: { addItems: onTodoSubmit },
    path: 'todos',
  });
}
