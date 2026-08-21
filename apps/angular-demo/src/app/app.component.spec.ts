import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { byTestId, text } from './test-utils';

const renderAt = async (route: string) => {
  TestBed.configureTestingModule({
    imports: [AppComponent],
    providers: [provideRouter(appRoutes)],
  });
  const fixture = TestBed.createComponent(AppComponent);
  const router = TestBed.inject(Router);
  await router.navigateByUrl(route);
  fixture.detectChanges();
  return fixture;
};

describe('App', () => {
  it('should render successfully', async () => {
    const fixture = await renderAt('/');

    expect(fixture.nativeElement).toBeTruthy();
  });

  it('should render the home hero by default', async () => {
    const fixture = await renderAt('/');

    expect(byTestId(fixture, 'hero')).toBeTruthy();
    expect(byTestId(fixture, 'card-counter')).toBeTruthy();
  });

  it('should render the counter route', async () => {
    const fixture = await renderAt('/counter');

    expect(text(fixture, 'counter-a-value')).toBe('0');
    expect(text(fixture, 'counter-b-value')).toBe('10');
  });

  it('should render the entity roster route', async () => {
    const fixture = await renderAt('/crew');

    expect(text(fixture, 'crew-count')).toBe('5');
    expect(byTestId(fixture, 'nav-crew')!.className).toContain('active');
  });

  it('should render an unknown route as not found', async () => {
    const fixture = await renderAt('/nope');

    expect(byTestId(fixture, 'not-found')).toBeTruthy();
  });
});
