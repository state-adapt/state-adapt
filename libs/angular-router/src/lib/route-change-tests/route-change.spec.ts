import { AsyncPipe } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injectable,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { adapt } from '@state-adapt/angular';
import { defer, NEVER } from 'rxjs';
import { finalize } from 'rxjs/operators';

// These expectations target Angular 19; the workspace upgrade is intentionally
// deferred, so passing under the current Angular 18 test graph is not a support claim.
describe.each([false, true])('route change behavior, zoneless=%s', zoneless => {
  const settleRenderProbe = async () => {
    TestBed.inject(ApplicationRef).tick();
    await new Promise<void>(resolve => setTimeout(resolve));
  };

  const setup = async (initialUrl: '/signal' | '/observable') => {
    const sourceLifecycle: string[] = [];

    @Injectable({ providedIn: 'root' })
    class TestService {
      count = adapt(0, {
        sources: defer(() => {
          sourceLifecycle.push('subscribed');
          return NEVER.pipe(finalize(() => sourceLifecycle.push('unsubscribed')));
        }),
      });
    }

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <div id="count">{{ count() }}</div>
      `,
    })
    class SignalComponent {
      count = inject(TestService).count;
    }

    @Component({
      imports: [AsyncPipe],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <div id="count">{{ count.state$ | async }}</div>
      `,
    })
    class ObservableComponent {
      count = inject(TestService).count;
    }

    @Component({ standalone: true, template: '' })
    class HomeComponent {}

    TestBed.configureTestingModule({
      providers: [
        ...(zoneless ? [provideExperimentalZonelessChangeDetection()] : []),
        provideRouter([
          { path: 'home', component: HomeComponent },
          { path: 'signal', component: SignalComponent },
          { path: 'observable', component: ObservableComponent },
          { path: '**', redirectTo: '/home' },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create(initialUrl);
    TestBed.inject(ApplicationRef).attachView(harness.fixture.componentRef.hostView);
    harness.detectChanges();
    await settleRenderProbe();

    return {
      harness,
      sourceLifecycle,
      getCount: () =>
        harness.fixture.nativeElement.querySelector('#count')?.textContent?.trim(),
    };
  };

  it('activates for a signal route, deactivates away from it, and reactivates', async () => {
    const { harness, sourceLifecycle, getCount } = await setup('/signal');

    expect(getCount()).toBe('0');
    expect(sourceLifecycle).toEqual(['subscribed']);

    await harness.navigateByUrl('/home');
    harness.detectChanges();
    await settleRenderProbe();

    expect(sourceLifecycle).toEqual(['subscribed', 'unsubscribed']);

    await harness.navigateByUrl('/signal');
    harness.detectChanges();
    await settleRenderProbe();

    expect(getCount()).toBe('0');
    expect(sourceLifecycle).toEqual(['subscribed', 'unsubscribed', 'subscribed']);
  });

  it('preserves the normal AsyncPipe subscription lifecycle across routes', async () => {
    const { harness, sourceLifecycle, getCount } = await setup('/observable');

    expect(getCount()).toBe('0');
    expect(sourceLifecycle).toEqual(['subscribed']);

    await harness.navigateByUrl('/home');
    harness.detectChanges();
    await settleRenderProbe();

    expect(sourceLifecycle).toEqual(['subscribed', 'unsubscribed']);
  });

  it('hands activation from an AsyncPipe route to a signal route', async () => {
    const { harness, sourceLifecycle, getCount } = await setup('/observable');

    await harness.navigateByUrl('/signal');
    harness.detectChanges();
    await settleRenderProbe();

    expect(getCount()).toBe('0');
    expect(sourceLifecycle).toEqual(['subscribed', 'unsubscribed', 'subscribed']);
  });
});
