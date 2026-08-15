import { addTodo, clearCompleted, getTodoItems, setFilter, toggleTodo } from './todos.po';

// Variations (trimming, blank input, every filter permutation, percentages) are
// covered by the adapter and component unit tests. This is the main journey.
describe('todos', () => {
  beforeEach(() => cy.visit('/todos'));

  it('renders the seeded todos', () => {
    getTodoItems().should('have.length', 3);
    cy.byTestId('todo-remaining').should('have.text', '2 remaining');
  });

  it('walks the main journey: add, complete, filter, clear', () => {
    addTodo('Write an end-to-end test');
    getTodoItems().should('have.length', 4);
    cy.byTestId('todo-remaining').should('have.text', '3 remaining');

    toggleTodo(2);
    cy.byTestId('todo-remaining').should('have.text', '2 remaining');

    setFilter('active');
    getTodoItems().should('have.length', 2);

    setFilter('completed');
    getTodoItems().should('have.length', 2);

    setFilter('all');
    clearCompleted();
    getTodoItems().should('have.length', 2);
    cy.contains('[data-testid="todo-item"]', 'Write an end-to-end test').should('exist');
  });
});
