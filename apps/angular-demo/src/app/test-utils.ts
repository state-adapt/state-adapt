import { ComponentFixture } from '@angular/core/testing';

export const byTestId = (fixture: ComponentFixture<unknown>, testId: string) =>
  fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;

export const allByTestId = (fixture: ComponentFixture<unknown>, testId: string) =>
  Array.from(
    fixture.nativeElement.querySelectorAll(`[data-testid="${testId}"]`),
  ) as HTMLElement[];

export const text = (fixture: ComponentFixture<unknown>, testId: string) =>
  byTestId(fixture, testId)?.textContent ?? null;

export const click = (fixture: ComponentFixture<unknown>, testId: string) => {
  byTestId(fixture, testId)!.click();
  fixture.detectChanges();
};

export const typeIn = (
  fixture: ComponentFixture<unknown>,
  testId: string,
  value: string,
) => {
  const input = byTestId(fixture, testId) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
};

export const selectValue = (
  fixture: ComponentFixture<unknown>,
  testId: string,
  value: string,
) => {
  const select = byTestId(fixture, testId) as HTMLSelectElement;
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  fixture.detectChanges();
};
