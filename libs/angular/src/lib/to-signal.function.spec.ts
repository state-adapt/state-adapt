import {
  afterNextRender,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  createEnvironmentInjector,
  effect,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  provideExperimentalZonelessChangeDetection,
  signal,
  Signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { defer, NEVER, of, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { toSignal } from './to-signal.function';

// These expectations target Angular 19's effect/change-detection timing.
describe('toSignal', () => {
  const settleRenderProbe = async () => {
    await new Promise<void>(resolve => setTimeout(resolve));
  };

  const attachToApplication = (fixture: {
    componentRef: { hostView: Parameters<ApplicationRef['attachView']>[0] };
  }) => {
    TestBed.inject(ApplicationRef).attachView(fixture.componentRef.hostView);
  };

  describe.each([false, true])('zoneless=%s', zoneless => {
    const providers = zoneless ? [provideExperimentalZonelessChangeDetection()] : [];

    it('does not subscribe for a one-off root signal read', async () => {
      let subscriptions = 0;

      @Injectable({ providedIn: 'root' })
      class RootService {
        value = toSignal(
          defer(() => {
            subscriptions++;
            return NEVER.pipe(finalize(() => subscriptions--));
          }),
          { initialValue: 0 },
        );
      }

      @Component({ standalone: true, template: '' })
      class AppComponent {}

      TestBed.configureTestingModule({ imports: [AppComponent], providers });
      const fixture = TestBed.createComponent(AppComponent);
      attachToApplication(fixture);
      const value = TestBed.inject(RootService).value;

      expect(value()).toBe(0);
      expect(subscriptions).toBe(0);

      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();

      expect(subscriptions).toBe(0);
    });

    it('coordinates independent activation when switching between root signals', async () => {
      const subscriptions = { first: 0, second: 0 };

      const trackedSource = (key: keyof typeof subscriptions) =>
        defer(() => {
          subscriptions[key]++;
          return NEVER.pipe(finalize(() => subscriptions[key]--));
        });

      @Injectable({ providedIn: 'root' })
      class RootService {
        first = toSignal(trackedSource('first'), { initialValue: 1 });
        second = toSignal(trackedSource('second'), { initialValue: 2 });
      }

      @Component({
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          {{ selected() === 'first' ? first() : second() }}
        `,
      })
      class AppComponent {
        selected = signal<'first' | 'second'>('first');
        service = inject(RootService);
        first = this.service.first;
        second = this.service.second;
      }

      TestBed.configureTestingModule({ imports: [AppComponent], providers });
      const fixture = TestBed.createComponent(AppComponent);
      attachToApplication(fixture);

      // Register the second signal as a candidate, but do not retain a consumer.
      expect(fixture.componentInstance.second()).toBe(2);

      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();

      expect(subscriptions).toEqual({ first: 1, second: 0 });

      fixture.componentInstance.selected.set('second');
      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();

      expect(subscriptions).toEqual({ first: 0, second: 1 });
    });

    it('does not activate a candidate destroyed during accounting or disturb another root signal', async () => {
      const subscriptions = { persistent: 0, destroyed: 0 };

      const trackedSource = (key: keyof typeof subscriptions) =>
        defer(() => {
          subscriptions[key]++;
          return NEVER.pipe(finalize(() => subscriptions[key]--));
        });

      @Injectable({ providedIn: 'root' })
      class RootService {
        value = toSignal(trackedSource('persistent'), { initialValue: 1 });
      }

      @Injectable()
      class ShortLivedService {
        value = toSignal(trackedSource('destroyed'), { initialValue: 2 });
      }

      TestBed.configureTestingModule({ providers });
      const shortLivedInjector = createEnvironmentInjector(
        [ShortLivedService],
        TestBed.inject(EnvironmentInjector),
      );
      const shortLivedSignal = shortLivedInjector.get(ShortLivedService).value;
      let shortLivedInjectorDestroyed = false;

      @Component({
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          {{ persistentValue() }} {{ shortLivedValue() }}
        `,
      })
      class AppComponent {
        persistentValue = inject(RootService).value;
        shortLivedValue = shortLivedSignal;
      }

      afterNextRender(
        () => {
          // The strategy itself waits two microtasks before probing. This
          // third microtask lands after its candidate snapshot and ping tick,
          // but before finishProbe's accounting microtask.
          queueMicrotask(() =>
            queueMicrotask(() => {
              queueMicrotask(() => {
                shortLivedInjectorDestroyed = true;
                shortLivedInjector.destroy();
              });
            }),
          );
        },
        { injector: TestBed.inject(Injector) },
      );
      const fixture = TestBed.createComponent(AppComponent);
      attachToApplication(fixture);

      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();

      expect(shortLivedInjectorDestroyed).toBe(true);
      expect(subscriptions).toEqual({ persistent: 1, destroyed: 0 });
    });

    it('subscribes while an OnPush template consumes a root signal', async () => {
      const source = new Subject<number>();
      let subscriptions = 0;

      @Injectable({ providedIn: 'root' })
      class RootService {
        value = toSignal(
          defer(() => {
            subscriptions++;
            return source.pipe(finalize(() => subscriptions--));
          }),
          { initialValue: 0 },
        );
      }

      @Component({
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          {{ visible() ? value() : 'hidden' }}
        `,
      })
      class AppComponent {
        visible = signal(true);
        value = inject(RootService).value;
      }

      TestBed.configureTestingModule({ imports: [AppComponent], providers });
      const fixture = TestBed.createComponent(AppComponent);
      attachToApplication(fixture);

      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();

      expect(subscriptions).toBe(1);
      expect(fixture.nativeElement.textContent.trim()).toBe('0');

      source.next(1);
      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();

      expect(subscriptions).toBe(1);
      expect(fixture.nativeElement.textContent.trim()).toBe('1');

      fixture.componentInstance.visible.set(false);
      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();

      expect(fixture.nativeElement.textContent.trim()).toBe('hidden');
      expect(subscriptions).toBe(0);
    });

    it('can reactivate after its previous consumer was destroyed', async () => {
      let subscriptions = 0;

      @Injectable({ providedIn: 'root' })
      class RootService {
        value = toSignal(
          defer(() => {
            subscriptions++;
            return NEVER.pipe(finalize(() => subscriptions--));
          }),
          { initialValue: 0 },
        );
      }

      @Component({
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          {{ value() }}
        `,
      })
      class ConsumerComponent {
        value = inject(RootService).value;
      }

      TestBed.configureTestingModule({ imports: [ConsumerComponent], providers });

      const firstFixture = TestBed.createComponent(ConsumerComponent);
      attachToApplication(firstFixture);
      firstFixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();
      expect(subscriptions).toBe(1);

      firstFixture.destroy();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();
      expect(subscriptions).toBe(0);

      const secondFixture = TestBed.createComponent(ConsumerComponent);
      attachToApplication(secondFixture);
      secondFixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();
      expect(subscriptions).toBe(1);
    });

    it('subscribes while an effect consumes a root signal', async () => {
      let subscriptions = 0;

      @Injectable({ providedIn: 'root' })
      class RootService {
        value = toSignal(
          defer(() => {
            subscriptions++;
            return NEVER.pipe(finalize(() => subscriptions--));
          }),
          { initialValue: 0 },
        );
      }

      @Component({ standalone: true, template: '' })
      class AppComponent {
        enabled = signal(true);
        value = inject(RootService).value;

        constructor() {
          effect(() => {
            if (this.enabled()) this.value();
          });
        }
      }

      TestBed.configureTestingModule({ imports: [AppComponent], providers });
      const fixture = TestBed.createComponent(AppComponent);
      attachToApplication(fixture);

      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();
      expect(subscriptions).toBe(1);

      fixture.componentInstance.enabled.set(false);
      fixture.detectChanges();
      await settleRenderProbe();
      expect(subscriptions).toBe(0);
    });

    it('does not resubscribe to a completed source while the consumer remains', async () => {
      let subscriptionCount = 0;

      @Injectable({ providedIn: 'root' })
      class RootService {
        value = toSignal(
          defer(() => {
            subscriptionCount++;
            return of(1);
          }),
          { initialValue: 0 },
        );
      }

      @Component({
        standalone: true,
        template: `
          {{ value() }}
        `,
      })
      class AppComponent {
        value = inject(RootService).value;
      }

      TestBed.configureTestingModule({ imports: [AppComponent], providers });
      const fixture = TestBed.createComponent(AppComponent);
      attachToApplication(fixture);

      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();

      expect(fixture.nativeElement.textContent.trim()).toBe('1');
      expect(subscriptionCount).toBe(1);
    });

    it('subscribes immediately in a component and unsubscribes on destroy', () => {
      let subscriptions = 0;

      @Component({
        standalone: true,
        template: `
          {{ value() }}
        `,
      })
      class LocalComponent {
        value = toSignal(
          defer(() => {
            subscriptions++;
            return NEVER.pipe(finalize(() => subscriptions--));
          }),
          { initialValue: 0 },
        );
      }

      TestBed.configureTestingModule({ imports: [LocalComponent], providers });
      const fixture = TestBed.createComponent(LocalComponent);

      expect(subscriptions).toBe(1);

      fixture.destroy();

      expect(subscriptions).toBe(0);
    });

    it('uses the host view lifetime for a component-provided service', () => {
      let subscriptions = 0;

      @Injectable()
      class LocalService {
        value = toSignal(
          defer(() => {
            subscriptions++;
            return NEVER.pipe(finalize(() => subscriptions--));
          }),
          { initialValue: 0 },
        );
      }

      @Component({
        standalone: true,
        providers: [LocalService],
        template: `
          {{ service.value() }}
        `,
      })
      class LocalComponent {
        service = inject(LocalService);
      }

      TestBed.configureTestingModule({ imports: [LocalComponent], providers });
      const fixture = TestBed.createComponent(LocalComponent);

      expect(subscriptions).toBe(1);

      fixture.destroy();

      expect(subscriptions).toBe(0);
    });

    it('creates initial value once per subscription, not per read', async () => {
      let calls = 0;

      @Injectable({ providedIn: 'root' })
      class RootService {
        value = toSignal<number>(NEVER, { initialValue: () => ++calls });
      }

      @Component({
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          {{ value() }}
        `,
      })
      class ConsumerComponent {
        value = inject(RootService).value;
      }

      TestBed.configureTestingModule({ imports: [ConsumerComponent], providers });
      const fixture = TestBed.createComponent(ConsumerComponent);
      attachToApplication(fixture);

      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();
      const callsWhileSubscribed = calls;

      // Later probes invalidate and re-read the signal while it stays subscribed
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();

      expect(calls).toBe(callsWhileSubscribed);
      expect(fixture.nativeElement.textContent.trim()).toBe(String(callsWhileSubscribed));

      fixture.destroy();
    });

    it('creates fresh initial value when it subscribes again', async () => {
      let name = 'John';

      @Injectable({ providedIn: 'root' })
      class RootService {
        value = toSignal<string>(new Subject<string>(), { initialValue: () => name });
      }

      @Component({
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          {{ value() }}
        `,
      })
      class ConsumerComponent {
        value = inject(RootService).value;
      }

      TestBed.configureTestingModule({ imports: [ConsumerComponent], providers });

      const firstFixture = TestBed.createComponent(ConsumerComponent);
      attachToApplication(firstFixture);
      firstFixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();
      expect(firstFixture.nativeElement.textContent.trim()).toBe('John');

      firstFixture.destroy();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();

      name = 'Jane';

      const secondFixture = TestBed.createComponent(ConsumerComponent);
      attachToApplication(secondFixture);
      secondFixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
      await settleRenderProbe();
      expect(secondFixture.nativeElement.textContent.trim()).toBe('Jane');

      secondFixture.destroy();
    });
  });
});
