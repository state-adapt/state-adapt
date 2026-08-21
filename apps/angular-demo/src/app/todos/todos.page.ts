import { Component, inject } from '@angular/core';
import { adapt } from '@state-adapt/angular';

import { TodoFilter } from './todos.adapter';
import { TodosStores, onTodoSubmit } from './todos.store';

const filters: TodoFilter[] = ['all', 'active', 'completed'];

@Component({
  standalone: true,
  selector: 'sa-todos-page',
  template: `
    <section class="panel">
      <h1>Todos</h1>
      <p class="muted">
        Two narrow adapters — one for the list, one for the filter — composed with
        <code>joinAdapters</code>, then layered with memoized selectors. The component
        does no deriving of its own.
      </p>

      <form
        class="field-row"
        (submit)="$event.preventDefault(); draft() && onTodoSubmit(draft())"
      >
        <input
          type="text"
          placeholder="What needs doing?"
          aria-label="New todo"
          data-testid="todo-input"
          [value]="draft()"
          (input)="draft.set($any($event.target).value)"
        />
        <button class="button primary" type="submit" data-testid="todo-add">
          Add
        </button>
      </form>

      <div class="progress" aria-hidden="true">
        <div class="progress-bar" [style.width.%]="todos.percentDone()"></div>
      </div>
      <p class="muted small" data-testid="todo-progress">{{ todos.completedCount() }} of {{ todos.total() }} done ({{ todos.percentDone() }}%)</p>
    </section>

    <section class="panel">
      <div class="row">
        <div class="filter-group" role="group" aria-label="Filter todos">
          @for (filter of filters; track filter) {
            <button
              class="chip"
              [class.active]="todos.filter() === filter"
              [attr.data-testid]="'filter-' + filter"
              [attr.aria-pressed]="todos.filter() === filter"
              (click)="todos.setFilter(filter)"
            >
              {{ filter }}
            </button>
          }
        </div>

        <div class="button-row">
          <button
            class="ghost"
            data-testid="todo-toggle-all"
            [disabled]="todos.total() === 0"
            (click)="todos.toggleItemsAll()"
          >{{ todos.allDone() ? 'Uncheck all' : 'Check all' }}</button>
          <button
            class="ghost danger"
            data-testid="todo-clear-completed"
            [disabled]="todos.completedCount() === 0"
            (click)="todos.clearItemsCompleted()"
          >
            Clear completed
          </button>
        </div>
      </div>

      <ul class="todo-list" data-testid="todo-list">
        @for (todo of todos.visible(); track todo.id) {
          <li [class.done]="todo.done" data-testid="todo-item">
            <label>
              <input
                type="checkbox"
                [checked]="todo.done"
                [attr.data-testid]="'todo-toggle-' + todo.id"
                (change)="todos.toggleItems(todo.id)"
              />
              <span data-testid="todo-text">{{ todo.text }}</span>
            </label>
            <button
              class="icon danger"
              [attr.aria-label]="'Remove ' + todo.text"
              [attr.data-testid]="'todo-remove-' + todo.id"
              (click)="todos.removeItems(todo.id)"
            >
              ✕
            </button>
          </li>
        }
      </ul>

      @if (todos.visible().length === 0) {
        <p class="muted empty" data-testid="todo-empty">
          Nothing here under the <strong>{{ todos.filter() }}</strong> filter.
        </p>
      }

      <p class="muted small" data-testid="todo-remaining">{{ todos.activeCount() }} remaining</p>
    </section>
  `,
})
export class TodosPageComponent {
  filters = filters;
  onTodoSubmit = onTodoSubmit;
  todos = inject(TodosStores).todos;
  draft = adapt('', {
    sources: { reset: onTodoSubmit },
    path: 'todoDraft',
  });
}
