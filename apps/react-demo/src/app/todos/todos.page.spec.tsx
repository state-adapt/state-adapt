import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { TodosPage } from './todos.page';

// The store deactivates when the last subscriber unmounts, which resets it — so
// Testing Library's automatic cleanup gives each test a fresh store.
const renderPage = () => render(<TodosPage />);

const texts = () =>
  screen.queryAllByTestId('todo-text').map(node => node.textContent);

describe('TodosPage', () => {
  it('renders the seeded todos with their derived counts', () => {
    renderPage();

    expect(screen.getAllByTestId('todo-item')).toHaveLength(3);
    expect(screen.getByTestId('todo-remaining').textContent).toBe('2 remaining');
    expect(screen.getByTestId('todo-progress').textContent).toBe('1 of 3 done (33%)');
  });

  it('adds a todo from the form and clears the input', () => {
    renderPage();
    const input = screen.getByTestId('todo-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'write a test' } });
    fireEvent.click(screen.getByTestId('todo-add'));

    expect(texts()).toContain('write a test');
    expect(input.value).toBe('');
    expect(screen.getByTestId('todo-remaining').textContent).toBe('3 remaining');
  });

  it('does not add a blank todo', () => {
    renderPage();

    fireEvent.change(screen.getByTestId('todo-input'), { target: { value: '   ' } });
    fireEvent.click(screen.getByTestId('todo-add'));

    expect(screen.getAllByTestId('todo-item')).toHaveLength(3);
  });

  it('toggles a todo and updates the progress readout', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('todo-toggle-2'));

    expect(screen.getByTestId('todo-remaining').textContent).toBe('1 remaining');
    expect(screen.getByTestId('todo-progress').textContent).toBe('2 of 3 done (67%)');
  });

  it('removes a todo', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('todo-remove-3'));

    expect(screen.getAllByTestId('todo-item')).toHaveLength(2);
    expect(texts()).not.toContain('Join some stores');
  });

  it('filters to active todos', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('filter-active'));

    expect(screen.getAllByTestId('todo-item')).toHaveLength(2);
    expect(texts()).not.toContain('Read the StateAdapt docs');
    expect(screen.getByTestId('filter-active').getAttribute('aria-pressed')).toBe('true');
  });

  it('filters to completed todos', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('filter-completed'));

    expect(texts()).toEqual(['Read the StateAdapt docs']);
  });

  it('shows an empty message when the filter matches nothing', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('todo-toggle-2'));
    fireEvent.click(screen.getByTestId('todo-toggle-3'));
    fireEvent.click(screen.getByTestId('filter-active'));

    expect(screen.queryAllByTestId('todo-item')).toHaveLength(0);
    expect(screen.getByTestId('todo-empty').textContent).toContain('active');
  });

  it('checks and unchecks every todo', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('todo-toggle-all'));
    expect(screen.getByTestId('todo-progress').textContent).toBe('3 of 3 done (100%)');
    expect(screen.getByTestId('todo-toggle-all').textContent).toBe('Uncheck all');

    fireEvent.click(screen.getByTestId('todo-toggle-all'));
    expect(screen.getByTestId('todo-progress').textContent).toBe('0 of 3 done (0%)');
  });

  it('clears completed todos and then disables the button', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('todo-clear-completed'));

    expect(screen.getAllByTestId('todo-item')).toHaveLength(2);
    expect(
      (screen.getByTestId('todo-clear-completed') as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
