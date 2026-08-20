export const addTodo = (text: string) => {
  cy.byTestId('todo-input').type(text);
  cy.byTestId('todo-add').click();
};

export const getTodoItems = () => cy.byTestId('todo-item');
export const getRemaining = () => cy.byTestId('todo-remaining');
export const getProgress = () => cy.byTestId('todo-progress');

export const setFilter = (filter: 'all' | 'active' | 'completed') =>
  cy.byTestId(`filter-${filter}`).click();

export const toggleTodo = (id: number) => cy.byTestId(`todo-toggle-${id}`).click();
export const removeTodo = (id: number) => cy.byTestId(`todo-remove-${id}`).click();
export const toggleAll = () => cy.byTestId('todo-toggle-all').click();
export const clearCompleted = () => cy.byTestId('todo-clear-completed').click();
