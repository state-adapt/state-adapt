import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { CrewPage } from './crew.page';

const renderAt = (route = '/crew') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/crew" element={<CrewPage />} />
        <Route path="/crew/:callSign" element={<CrewPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('CrewPage roster', () => {
  it('renders normalized roster statistics and cards', () => {
    renderAt();

    expect(screen.getByTestId('crew-count').textContent).toBe('5');
    expect(screen.getByTestId('crew-active-count').textContent).toBe('3');
    expect(screen.getByTestId('crew-available-count').textContent).toBe('3');
    expect(screen.getAllByTestId('crew-card')).toHaveLength(5);
  });

  it('filters using generated entity selectors', () => {
    renderAt();

    fireEvent.click(screen.getByTestId('crew-filter-selected'));

    expect(screen.getAllByTestId('crew-card')).toHaveLength(2);
    expect(screen.getByText('Eli Okafor')).toBeTruthy();
    expect(screen.queryByText('Mara Velez')).toBeNull();
  });

  it('selects one and applies a bulk reaction to the selected filter', () => {
    renderAt();

    fireEvent.click(screen.getByTestId('crew-select-echo-9'));
    expect(screen.getByTestId('crew-selected-count').textContent).toBe('1');

    fireEvent.click(screen.getByTestId('crew-award-selected'));

    expect(screen.getByTestId('crew-clearance-atlas-2').textContent).toBe('L5');
    expect(screen.getByTestId('crew-clearance-echo-9').textContent).toBe('L3');
  });

  it('adds and removes normalized records', () => {
    renderAt();

    fireEvent.change(screen.getByTestId('crew-recruit-input'), {
      target: { value: 'Tessa Moon' },
    });
    fireEvent.click(screen.getByTestId('crew-recruit'));

    expect(screen.getByText('Tessa Moon')).toBeTruthy();
    expect(screen.getByTestId('crew-count').textContent).toBe('6');
    expect((screen.getByTestId('crew-recruit-input') as HTMLInputElement).value).toBe('');

    fireEvent.click(screen.getByLabelText('Remove Tessa Moon'));
    expect(screen.queryByText('Tessa Moon')).toBeNull();
    expect(screen.getByTestId('crew-count').textContent).toBe('5');
  });

  it('upserts an existing member and a new dispatch record', () => {
    renderAt();

    fireEvent.click(screen.getByTestId('crew-sync'));

    expect(screen.getByText('Sana Idris')).toBeTruthy();
    expect(screen.getByTestId('crew-count').textContent).toBe('6');
    expect(screen.getByTestId('crew-active-count').textContent).toBe('5');
  });
});

describe('CrewPage detail', () => {
  it('deep-links to a member and updates that entity in place', () => {
    renderAt('/crew/lumen-4');

    expect(screen.getByTestId('crew-detail').textContent).toContain('Jun Park');
    expect(screen.getByTestId('crew-detail-missions').textContent).toBe('12');

    fireEvent.click(screen.getByTestId('crew-log-mission'));
    fireEvent.click(screen.getByTestId('crew-promote'));
    fireEvent.change(screen.getByTestId('crew-status'), {
      target: { value: 'active' },
    });

    expect(screen.getByTestId('crew-detail-missions').textContent).toBe('13');
    expect(screen.getByTestId('crew-detail-clearance').textContent).toBe('Level 3');
    expect((screen.getByTestId('crew-status') as HTMLSelectElement).value).toBe('active');
  });

  it('renders a useful state for an unknown entity id', () => {
    renderAt('/crew/unknown');

    expect(screen.getByTestId('crew-not-found')).toBeTruthy();
  });
});
