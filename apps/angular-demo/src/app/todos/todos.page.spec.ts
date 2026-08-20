import { ComponentFixture, TestBed } from '@angular/core/testing';

import { allByTestId, byTestId, click, text, typeIn } from '../test-utils';
import { TodosPageComponent } from './todos.page';

// The store deactivates when the last subscriber unmounts, which resets it — so
// destroying the TestBed fixture between tests gives each test a fresh store.
const renderPage = () => {
  TestBed.configureTestingModule({
    imports: [TodosPageComponent],
  });
  const fixture = TestBed.createComponent(TodosPageComponent);
  fixture.detectChanges();
  return fixture;
};

const texts = (fixture: ComponentFixture<TodosPageComponent>) =>
  allByTestId(fixture, 'todo-text').map(node => node.textContent);

describe('TodosPage', () => {
  it('renders the seeded todos with their derived counts', () => {
    const fixture = renderPage();

    expect(allByTestId(fixture, 'todo-item')).toHaveLength(3);
    expect(text(fixture, 'todo-remaining')).toBe('2 remaining');
    expect(text(fixture, 'todo-progress')).toBe('1 of 3 done (33%)');
  });

  it('adds a todo from the form and clears the input', () => {
    const fixture = renderPage();
    const input = byTestId(fixture, 'todo-input') as HTMLInputElement;

    typeIn(fixture, 'todo-input', 'write a test');
    click(fixture, 'todo-add');

    expect(texts(fixture)).toContain('write a test');
    expect(input.value).toBe('');
    expect(text(fixture, 'todo-remaining')).toBe('3 remaining');
  });

  it('does not add a blank todo', () => {
    const fixture = renderPage();

    typeIn(fixture, 'todo-input', '   ');
    click(fixture, 'todo-add');

    expect(allByTestId(fixture, 'todo-item')).toHaveLength(3);
  });

  it('toggles a todo and updates the progress readout', () => {
    const fixture = renderPage();

    click(fixture, 'todo-toggle-2');

    expect(text(fixture, 'todo-remaining')).toBe('1 remaining');
    expect(text(fixture, 'todo-progress')).toBe('2 of 3 done (67%)');
  });

  it('removes a todo', () => {
    const fixture = renderPage();

    click(fixture, 'todo-remove-3');

    expect(allByTestId(fixture, 'todo-item')).toHaveLength(2);
    expect(texts(fixture)).not.toContain('Join some stores');
  });

  it('filters to active todos', () => {
    const fixture = renderPage();

    click(fixture, 'filter-active');

    expect(allByTestId(fixture, 'todo-item')).toHaveLength(2);
    expect(texts(fixture)).not.toContain('Read the StateAdapt docs');
    expect(byTestId(fixture, 'filter-active')!.getAttribute('aria-pressed')).toBe('true');
  });

  it('filters to completed todos', () => {
    const fixture = renderPage();

    click(fixture, 'filter-completed');

    expect(texts(fixture)).toEqual(['Read the StateAdapt docs']);
  });

  it('shows an empty message when the filter matches nothing', () => {
    const fixture = renderPage();

    click(fixture, 'todo-toggle-2');
    click(fixture, 'todo-toggle-3');
    click(fixture, 'filter-active');

    expect(allByTestId(fixture, 'todo-item')).toHaveLength(0);
    expect(text(fixture, 'todo-empty')).toContain('active');
  });

  it('checks and unchecks every todo', () => {
    const fixture = renderPage();

    click(fixture, 'todo-toggle-all');
    expect(text(fixture, 'todo-progress')).toBe('3 of 3 done (100%)');
    expect(text(fixture, 'todo-toggle-all')).toBe('Uncheck all');

    click(fixture, 'todo-toggle-all');
    expect(text(fixture, 'todo-progress')).toBe('0 of 3 done (0%)');
  });

  it('clears completed todos and then disables the button', () => {
    const fixture = renderPage();

    click(fixture, 'todo-clear-completed');

    expect(allByTestId(fixture, 'todo-item')).toHaveLength(2);
    expect((byTestId(fixture, 'todo-clear-completed') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});
