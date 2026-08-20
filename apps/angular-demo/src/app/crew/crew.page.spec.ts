import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { CrewPageComponent } from './crew.page';

const byTestId = (root: Element, testId: string) =>
  root.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;

const allByTestId = (root: Element, testId: string) =>
  Array.from(root.querySelectorAll(`[data-testid="${testId}"]`)) as HTMLElement[];

const text = (root: Element, testId: string) => byTestId(root, testId)?.textContent ?? null;

const click = (harness: RouterTestingHarness, testId: string) => {
  byTestId(harness.routeNativeElement!, testId)!.click();
  harness.detectChanges();
};

const typeIn = (harness: RouterTestingHarness, testId: string, value: string) => {
  const input = byTestId(harness.routeNativeElement!, testId) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  harness.detectChanges();
};

const selectValue = (harness: RouterTestingHarness, testId: string, value: string) => {
  const select = byTestId(harness.routeNativeElement!, testId) as HTMLSelectElement;
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  harness.detectChanges();
};

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
    const root = harness.routeNativeElement!;

    expect(text(root, 'crew-count')).toBe('5');
    expect(text(root, 'crew-active-count')).toBe('3');
    expect(text(root, 'crew-available-count')).toBe('3');
    expect(allByTestId(root, 'crew-card')).toHaveLength(5);
  });

  it('filters using generated entity selectors', async () => {
    const harness = await renderAt();
    const root = harness.routeNativeElement!;

    click(harness, 'crew-filter-selected');

    expect(allByTestId(root, 'crew-card')).toHaveLength(2);
    expect(root.textContent).toContain('Eli Okafor');
    expect(root.textContent).not.toContain('Mara Velez');
  });

  it('selects one and applies a bulk reaction to the selected filter', async () => {
    const harness = await renderAt();
    const root = harness.routeNativeElement!;

    click(harness, 'crew-select-echo-9');
    expect(text(root, 'crew-selected-count')).toBe('1');

    click(harness, 'crew-award-selected');

    expect(text(root, 'crew-clearance-atlas-2')).toBe('L5');
    expect(text(root, 'crew-clearance-echo-9')).toBe('L3');
  });

  it('adds and removes normalized records', async () => {
    const harness = await renderAt();
    const root = harness.routeNativeElement!;

    typeIn(harness, 'crew-recruit-input', 'Tessa Moon');
    click(harness, 'crew-recruit');

    expect(root.textContent).toContain('Tessa Moon');
    expect(text(root, 'crew-count')).toBe('6');
    expect((byTestId(root, 'crew-recruit-input') as HTMLInputElement).value).toBe('');

    const remove = root.querySelector('[aria-label="Remove Tessa Moon"]') as HTMLElement;
    remove.click();
    harness.detectChanges();
    expect(root.textContent).not.toContain('Tessa Moon');
    expect(text(root, 'crew-count')).toBe('5');
  });

  it('upserts an existing member and a new dispatch record', async () => {
    const harness = await renderAt();
    const root = harness.routeNativeElement!;

    click(harness, 'crew-sync');

    expect(root.textContent).toContain('Sana Idris');
    expect(text(root, 'crew-count')).toBe('6');
    expect(text(root, 'crew-active-count')).toBe('5');
  });
});

describe('CrewPage detail', () => {
  it('deep-links to a member and updates that entity in place', async () => {
    const harness = await renderAt('/crew/lumen-4');
    const root = harness.routeNativeElement!;

    expect(text(root, 'crew-detail')).toContain('Jun Park');
    expect(text(root, 'crew-detail-missions')).toBe('12');

    click(harness, 'crew-log-mission');
    click(harness, 'crew-promote');
    selectValue(harness, 'crew-status', 'active');

    expect(text(root, 'crew-detail-missions')).toBe('13');
    expect(text(root, 'crew-detail-clearance')).toBe('Level 3');
    expect((byTestId(root, 'crew-status') as HTMLSelectElement).value).toBe('active');
  });

  it('renders a useful state for an unknown entity id', async () => {
    const harness = await renderAt('/crew/unknown');
    const root = harness.routeNativeElement!;

    expect(byTestId(root, 'crew-not-found')).toBeTruthy();
  });
});
