import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import {
  allByTestId,
  byTestId,
  click,
  rootOf,
  selectValue,
  text,
  typeIn,
} from '../test-utils';
import { CrewPageComponent } from './crew.page';

const renderAt = async (route = '/crew') => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'crew', component: CrewPageComponent },
        { path: 'crew/:callSign', component: CrewPageComponent },
      ]),
    ],
  });
  const harness = await RouterTestingHarness.create(route);
  harness.detectChanges();
  return harness;
};

describe('CrewPage roster', () => {
  it('renders normalized roster statistics and cards', async () => {
    const harness = await renderAt();

    expect(text(harness, 'crew-count')).toBe('5');
    expect(text(harness, 'crew-active-count')).toBe('3');
    expect(text(harness, 'crew-available-count')).toBe('3');
    expect(allByTestId(harness, 'crew-card')).toHaveLength(5);
  });

  it('filters using generated entity selectors', async () => {
    const harness = await renderAt();
    const root = rootOf(harness);

    click(harness, 'crew-filter-selected');

    expect(allByTestId(harness, 'crew-card')).toHaveLength(2);
    expect(root.textContent).toContain('Eli Okafor');
    expect(root.textContent).not.toContain('Mara Velez');
  });

  it('selects one and applies a bulk reaction to the selected filter', async () => {
    const harness = await renderAt();

    click(harness, 'crew-select-echo-9');
    expect(text(harness, 'crew-selected-count')).toBe('1');

    click(harness, 'crew-award-selected');

    expect(text(harness, 'crew-clearance-atlas-2')).toBe('L5');
    expect(text(harness, 'crew-clearance-echo-9')).toBe('L3');
  });

  it('adds and removes normalized records', async () => {
    const harness = await renderAt();
    const root = rootOf(harness);

    typeIn(harness, 'crew-recruit-input', 'Tessa Moon');
    click(harness, 'crew-recruit');

    expect(root.textContent).toContain('Tessa Moon');
    expect(text(harness, 'crew-count')).toBe('6');
    expect((byTestId(harness, 'crew-recruit-input') as HTMLInputElement).value).toBe('');

    const remove = root.querySelector('[aria-label="Remove Tessa Moon"]') as HTMLElement;
    remove.click();
    harness.detectChanges();
    expect(root.textContent).not.toContain('Tessa Moon');
    expect(text(harness, 'crew-count')).toBe('5');
  });

  it('upserts an existing member and a new dispatch record', async () => {
    const harness = await renderAt();
    const root = rootOf(harness);

    click(harness, 'crew-sync');

    expect(root.textContent).toContain('Sana Idris');
    expect(text(harness, 'crew-count')).toBe('6');
    expect(text(harness, 'crew-active-count')).toBe('5');
  });
});

describe('CrewPage detail', () => {
  it('deep-links to a member and updates that entity in place', async () => {
    const harness = await renderAt('/crew/lumen-4');

    expect(text(harness, 'crew-detail')).toContain('Jun Park');
    expect(text(harness, 'crew-detail-missions')).toBe('12');

    click(harness, 'crew-log-mission');
    click(harness, 'crew-promote');
    selectValue(harness, 'crew-status', 'active');

    expect(text(harness, 'crew-detail-missions')).toBe('13');
    expect(text(harness, 'crew-detail-clearance')).toBe('Level 3');
    expect((byTestId(harness, 'crew-status') as HTMLSelectElement).value).toBe('active');
  });

  it('renders a useful state for an unknown entity id', async () => {
    const harness = await renderAt('/crew/unknown');

    expect(byTestId(harness, 'crew-not-found')).toBeTruthy();
  });
});
