import { TodosState, todosAdapter } from './todos.adapter';

const state = (
  items: { id: number; text: string; done: boolean }[],
  filter: TodosState['filter'] = 'all',
): TodosState => ({ items, filter });

const base = state([
  { id: 1, text: 'one', done: true },
  { id: 2, text: 'two', done: false },
  { id: 3, text: 'three', done: false },
]);

const select = <K extends keyof typeof todosAdapter.selectors>(
  name: K,
  s: TodosState,
) => (todosAdapter.selectors[name] as any)(s);

describe('todosAdapter reactions', () => {
  it('adds a todo', () => {
    const next = todosAdapter.addItems(base, 'four', base);

    expect(next.items).toHaveLength(4);
    expect(next.items[3]).toMatchObject({ text: 'four', done: false });
  });

  it('trims whitespace when adding', () => {
    const next = todosAdapter.addItems(base, '   padded   ', base);

    expect(next.items[3].text).toBe('padded');
  });

  it('ignores a blank todo', () => {
    expect(todosAdapter.addItems(base, '   ', base).items).toHaveLength(3);
    expect(todosAdapter.addItems(base, '', base).items).toHaveLength(3);
  });

  it('gives each new todo a distinct id', () => {
    const once = todosAdapter.addItems(base, 'a', base);
    const twice = todosAdapter.addItems(once, 'b', base);

    const ids = twice.items.map(todo => todo.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toggles one todo without touching the rest', () => {
    const next = todosAdapter.toggleItems(base, 2, base);

    expect(next.items.find(todo => todo.id === 2)?.done).toBe(true);
    expect(next.items.find(todo => todo.id === 3)?.done).toBe(false);
    expect(next.items.find(todo => todo.id === 1)?.done).toBe(true);
  });

  it('toggles a todo back off', () => {
    const on = todosAdapter.toggleItems(base, 2, base);
    const off = todosAdapter.toggleItems(on, 2, base);

    expect(off.items.find(todo => todo.id === 2)?.done).toBe(false);
  });

  it('removes a todo by id', () => {
    const next = todosAdapter.removeItems(base, 2, base);

    expect(next.items.map(todo => todo.id)).toEqual([1, 3]);
  });

  it('ignores removing an unknown id', () => {
    expect(todosAdapter.removeItems(base, 99, base).items).toHaveLength(3);
  });

  it('clears only completed todos', () => {
    const next = todosAdapter.clearItemsCompleted(base, undefined as void, base);

    expect(next.items.map(todo => todo.id)).toEqual([2, 3]);
  });

  it('checks every todo when some are outstanding', () => {
    const next = todosAdapter.toggleItemsAll(base, undefined as void, base);

    expect(next.items.every(todo => todo.done)).toBe(true);
  });

  it('unchecks every todo when all are already done', () => {
    const allDone = state(base.items.map(todo => ({ ...todo, done: true })));
    const next = todosAdapter.toggleItemsAll(allDone, undefined as void, allDone);

    expect(next.items.every(todo => !todo.done)).toBe(true);
  });

  it('sets the filter', () => {
    expect(todosAdapter.setFilter(base, 'completed', base).filter).toBe('completed');
  });

  it('leaves the filter alone when items change', () => {
    const active = state(base.items, 'active');

    expect(todosAdapter.addItems(active, 'four', active).filter).toBe('active');
  });
});

describe('todosAdapter selectors', () => {
  it('splits active and completed', () => {
    expect(select('itemsActive', base).map((t: any) => t.id)).toEqual([2, 3]);
    expect(select('itemsCompleted', base).map((t: any) => t.id)).toEqual([1]);
  });

  it('counts', () => {
    expect(select('activeCount', base)).toBe(2);
    expect(select('completedCount', base)).toBe(1);
    expect(select('total', base)).toBe(3);
  });

  it('shows everything under the "all" filter', () => {
    expect(select('visible', base)).toHaveLength(3);
  });

  it('shows only active todos under the "active" filter', () => {
    const next = state(base.items, 'active');

    expect(select('visible', next).map((t: any) => t.id)).toEqual([2, 3]);
  });

  it('shows only completed todos under the "completed" filter', () => {
    const next = state(base.items, 'completed');

    expect(select('visible', next).map((t: any) => t.id)).toEqual([1]);
  });

  it('reports allDone only when there is something to be done', () => {
    expect(select('allDone', base)).toBe(false);
    expect(select('allDone', state([]))).toBe(false);
    expect(
      select('allDone', state(base.items.map(todo => ({ ...todo, done: true })))),
    ).toBe(true);
  });

  it('rounds the completed percentage', () => {
    expect(select('percentDone', base)).toBe(33);
    expect(select('percentDone', state([base.items[0], base.items[1]]))).toBe(50);
    expect(select('percentDone', state([]))).toBe(0);
  });
});
