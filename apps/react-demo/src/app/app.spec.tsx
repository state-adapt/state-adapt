import React from 'react';
import { render, screen } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';

import App from './app';

const renderAt = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = renderAt('/');

    expect(baseElement).toBeTruthy();
  });

  it('should render the home hero by default', () => {
    renderAt('/');

    expect(screen.getByTestId('hero')).toBeTruthy();
    expect(screen.getByTestId('card-counter')).toBeTruthy();
  });

  it('should render the counter route', () => {
    renderAt('/counter');

    expect(screen.getByTestId('counter-a-value').textContent).toBe('0');
    expect(screen.getByTestId('counter-b-value').textContent).toBe('10');
  });

  it('should render an unknown route as not found', () => {
    renderAt('/nope');

    expect(screen.getByTestId('not-found')).toBeTruthy();
  });
});
