import { createAdapter, joinAdapters } from '@state-adapt/core';

export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';

export interface TodosState {
  items: Todo[];
  filter: TodoFilter;
}

let nextId = 0;
const createTodo = (text: string): Todo => ({ id: ++nextId, text, done: false });

export const initialTodosState: TodosState = {
  items: [
    { id: ++nextId, text: 'Read the StateAdapt docs', done: true },
    { id: ++nextId, text: 'Build an adapter', done: false },
    { id: ++nextId, text: 'Join some stores', done: false },
  ],
  filter: 'all',
};

/** Knows only about a list of todos — nothing about filtering. */
const itemsAdapter = createAdapter<Todo[]>()({
  add: (items, text: string) =>
    !text.trim() ? items : [...items, createTodo(text.trim())],
  toggle: (items, id: number) =>
    items.map(todo => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
  remove: (items, id: number) => items.filter(todo => todo.id !== id),
  clearCompleted: items => items.filter(todo => !todo.done),
  toggleAll: items => {
    const allDone = items.every(todo => todo.done);
    return items.map(todo => ({ ...todo, done: !allDone }));
  },
  selectors: {
    active: items => items.filter(todo => !todo.done),
    completed: items => items.filter(todo => todo.done),
  },
});

/** Knows only about which filter is selected. */
const filterAdapter = createAdapter<TodoFilter>()({});

/**
 * `joinAdapters` composes the two narrow adapters above into one adapter for the
 * whole `TodosState`. Each sub-adapter's reactions get their namespace inserted
 * after the first word (`add` -> `addItems`, `clearCompleted` ->
 * `clearItemsCompleted`), its selectors get prefixed (`active` ->
 * `itemsActive`), and each state slice gets a selector named after it (`items`,
 * `filter`). Further blocks layer selectors that span both slices.
 */
export const todosAdapter = joinAdapters<TodosState>()({
  items: itemsAdapter,
  filter: filterAdapter,
})({
  visible: s =>
    s.filter === 'active'
      ? s.itemsActive
      : s.filter === 'completed'
      ? s.itemsCompleted
      : s.items,
  activeCount: s => s.itemsActive.length,
  completedCount: s => s.itemsCompleted.length,
  total: s => s.items.length,
})({
  allDone: s => s.total > 0 && s.activeCount === 0,
  percentDone: s => (s.total === 0 ? 0 : Math.round((s.completedCount / s.total) * 100)),
})();
