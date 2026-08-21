import { ComponentFixture } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';

/**
 * A component rendered on its own or through a route. Both expose a root element
 * and a way to flush change detection, so specs query them the same way.
 */
export type Rendered = ComponentFixture<unknown> | RouterTestingHarness;

export const rootOf = (rendered: Rendered): Element =>
  'routeNativeElement' in rendered
    ? (rendered.routeNativeElement as Element)
    : (rendered.nativeElement as Element);

export const byTestId = (rendered: Rendered, testId: string) =>
  rootOf(rendered).querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;

export const allByTestId = (rendered: Rendered, testId: string) =>
  Array.from(
    rootOf(rendered).querySelectorAll(`[data-testid="${testId}"]`),
  ) as HTMLElement[];

export const text = (rendered: Rendered, testId: string) =>
  byTestId(rendered, testId)?.textContent ?? null;

export const click = (rendered: Rendered, testId: string) => {
  byTestId(rendered, testId)!.click();
  rendered.detectChanges();
};

export const typeIn = (rendered: Rendered, testId: string, value: string) => {
  const input = byTestId(rendered, testId) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  rendered.detectChanges();
};

export const selectValue = (rendered: Rendered, testId: string, value: string) => {
  const select = byTestId(rendered, testId) as HTMLSelectElement;
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  rendered.detectChanges();
};
