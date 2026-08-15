import React, { useState } from 'react';
import { useStore } from '@state-adapt/react';

import { TodoFilter } from './todos.adapter';
import { todosStore } from './todos.store';

const filters: TodoFilter[] = ['all', 'active', 'completed'];

export function TodosPage() {
  const [todos, store] = useStore(todosStore);
  const [draft, setDraft] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    store.addItems(draft);
    setDraft('');
  };

  return (
    <>
      <section className="panel">
        <h1>Todos</h1>
        <p className="muted">
          Two narrow adapters — one for the list, one for the filter — composed with{' '}
          <code>joinAdapters</code>, then layered with memoized selectors. The component
          does no deriving of its own.
        </p>

        <form className="field-row" onSubmit={submit}>
          <input
            type="text"
            placeholder="What needs doing?"
            aria-label="New todo"
            data-testid="todo-input"
            value={draft}
            onChange={event => setDraft(event.target.value)}
          />
          <button className="button primary" type="submit" data-testid="todo-add">
            Add
          </button>
        </form>

        <div className="progress" aria-hidden="true">
          <div className="progress-bar" style={{ width: `${todos.percentDone}%` }} />
        </div>
        <p className="muted small" data-testid="todo-progress">
          {todos.completedCount} of {todos.total} done ({todos.percentDone}%)
        </p>
      </section>

      <section className="panel">
        <div className="row">
          <div className="filter-group" role="group" aria-label="Filter todos">
            {filters.map(filter => (
              <button
                key={filter}
                className={`chip ${todos.filter === filter ? 'active' : ''}`}
                data-testid={`filter-${filter}`}
                aria-pressed={todos.filter === filter}
                onClick={() => store.setFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="button-row">
            <button
              className="ghost"
              data-testid="todo-toggle-all"
              disabled={todos.total === 0}
              onClick={() => store.toggleItemsAll()}
            >
              {todos.allDone ? 'Uncheck all' : 'Check all'}
            </button>
            <button
              className="ghost danger"
              data-testid="todo-clear-completed"
              disabled={todos.completedCount === 0}
              onClick={() => store.clearItemsCompleted()}
            >
              Clear completed
            </button>
          </div>
        </div>

        <ul className="todo-list" data-testid="todo-list">
          {todos.visible.map(todo => (
            <li key={todo.id} className={todo.done ? 'done' : ''} data-testid="todo-item">
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  data-testid={`todo-toggle-${todo.id}`}
                  onChange={() => store.toggleItems(todo.id)}
                />
                <span data-testid="todo-text">{todo.text}</span>
              </label>
              <button
                className="icon danger"
                aria-label={`Remove ${todo.text}`}
                data-testid={`todo-remove-${todo.id}`}
                onClick={() => store.removeItems(todo.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {todos.visible.length === 0 && (
          <p className="muted empty" data-testid="todo-empty">
            Nothing here under the <strong>{todos.filter}</strong> filter.
          </p>
        )}

        <p className="muted small" data-testid="todo-remaining">
          {todos.activeCount} remaining
        </p>
      </section>
    </>
  );
}
