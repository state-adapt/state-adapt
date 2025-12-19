import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import {
  Component,
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  Injectable,
  provideExperimentalZonelessChangeDetection,
  signal,
} from '@angular/core';
import { concat, merge, NEVER, of, timer } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { adapt } from './adapt.function';

describe('adapt signals', () => {
  describe('activation timing', () => {
    [
      { zoneless: true, signalPing: 1000 },
      { zoneless: false, signalPing: 1000 },
      { zoneless: true, signalPing: 10 },
      { zoneless: false, signalPing: 10 },
    ].forEach(({ zoneless, signalPing }) => {
      const setup = () => {
        TestBed.configureTestingModule({
          providers: zoneless ? [provideExperimentalZonelessChangeDetection()] : [],
        });
        return TestBed.runInInjectionContext(() => {
          const state = { subscribed: false };
          const count = adapt(0, {
            signalPing,
            sources: {
              set: [
                merge(
                  of(1),
                  timer(signalPing / 2).pipe(map(() => 2)),
                  timer((3 * signalPing) / 2).pipe(map(() => 3)),
                  NEVER,
                ).pipe(
                  tap(() => (state.subscribed = true)),
                  finalize(() => (state.subscribed = false)),
                ),
              ],
            },
            adapter: {
              selectors: {
                double: s => s * 2,
              },
            },
          });
          return { count, state };
        });
      };

      it(`should activate on state and deactivate after ${signalPing} ms, zoneless=${zoneless}`, fakeAsync(() => {
        const { count, state } = setup();
        expect(state.subscribed).toBe(false);
        expect(count.readOnce()).toBe(0);
        count();
        expect(state.subscribed).toBe(true);
        expect(count.readOnce()).toBe(1);
        tick(signalPing - 1);
        expect(state.subscribed).toBe(true);
        expect(count.readOnce()).toBe(2);
        tick(2);
        expect(state.subscribed).toBe(false);
        expect(count.readOnce()).toBe(0);
      }));

      it(`should activate on derived state and deactivate after ${signalPing} ms, zoneless=${zoneless}`, fakeAsync(() => {
        const { count, state } = setup();
        expect(state.subscribed).toBe(false);
        expect(count.readOnce()).toBe(0);
        count.double();
        expect(state.subscribed).toBe(true);
        expect(count.readOnce()).toBe(1);
        tick(signalPing - 1);
        expect(state.subscribed).toBe(true);
        expect(count.readOnce()).toBe(2);
        tick(2);
        expect(state.subscribed).toBe(false);
        expect(count.readOnce()).toBe(0);
      }));

      it(`should stay active while there are effects, zoneless=${zoneless}, signalPing=${signalPing}`, fakeAsync(() => {
        const { count, state } = setup();
        TestBed.runInInjectionContext(() => {
          expect(state.subscribed).toBe(false);
          expect(count.readOnce()).toBe(0);
          const e1 = effect(() => count());
          // Not immediately read
          expect(state.subscribed).toBe(false);
          expect(count.readOnce()).toBe(0);
          tick(); // flush microtasks
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(1);
          tick(signalPing - 1);
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(2);
          tick(2);
          // This time, the ping find someone still interested
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(2);
          e1.destroy();
          // We have no idea nobody is listening anymore
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(2);
          // Next observable will emit even though nobody cares
          tick(signalPing / 2);
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(3);
          // But after the next ping, it's detected
          tick(signalPing / 2);
          expect(state.subscribed).toBe(false);
          expect(count.readOnce()).toBe(0);
        });
      }));

      it(`should stay active while there are either effects or RxJS subscriptions to state$, zoneless=${zoneless}, signalPing=${signalPing}`, fakeAsync(() => {
        const { count, state } = setup();
        let stateValue: number | undefined;
        TestBed.runInInjectionContext(() => {
          // Plain RxJS lifecycle
          expect(state.subscribed).toBe(false);
          expect(count.readOnce()).toBe(0);
          const sub1 = count.state$.subscribe(v => (stateValue = v));
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(1);
          sub1.unsubscribe();
          expect(state.subscribed).toBe(false);
          expect(count.readOnce()).toBe(0);

          // effect + later RxJS to keep alive
          const e1 = effect(() => count());
          // Not immediately read
          expect(state.subscribed).toBe(false);
          expect(count.readOnce()).toBe(0);
          tick(); // flush microtasks
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(1);
          tick(signalPing - 1);
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(2);
          tick(2);
          // The ping finds someone still interested
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(2);
          e1.destroy();
          // No effect, but we have no idea nobody is listening anymore
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(2);
          // Next observable will emit even though nobody cares
          tick(signalPing / 2);
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(3);
          // Before the next ping, saved by RxJS
          const sub2 = count.state$.subscribe(v => (stateValue = v));
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(3);
          expect(stateValue).toBe(3);
          // After the next ping, effect is no longer there, but RxJS keeps it alive
          tick(signalPing / 2);
          expect(state.subscribed).toBe(true);
          expect(count.readOnce()).toBe(3);
          expect(stateValue).toBe(3);
          // Now RxJS lets it go
          sub2.unsubscribe();
          expect(state.subscribed).toBe(false);
          expect(count.readOnce()).toBe(0);
        });
      }));
    });
  });

  describe('when defined in contexts that will be destroyed', () => {
    [
      { zoneless: true, signalPing: 1000 },
      { zoneless: false, signalPing: 1000 },
      { zoneless: true, signalPing: 10 },
      { zoneless: false, signalPing: 10 },
    ].forEach(({ zoneless, signalPing }) => {
      const setup = ({
        destroyed = {
          component: false,
          directive: false,
          service: false,
        },
        getSources = (type: 'component' | 'directive' | 'service') => of(0),
      } = {}) => {
        @Injectable({ providedIn: 'root' })
        class DependencyService {
          forComponent = adapt(0, { sources: getSources('component') });
          forDirective = adapt(0, { sources: getSources('directive') });
          forService = adapt(0, { sources: getSources('service') });
        }

        @Injectable()
        class Service {
          dependencyService = inject(DependencyService);
          count = adapt(0, {
            sources: this.dependencyService.forService.state$,
            signalPing,
          });

          constructor() {
            effect(() => this.count());

            inject(DestroyRef).onDestroy(() => {
              destroyed.service = true;
            });
          }
        }

        @Directive({
          selector: '[saDirective]',
          standalone: true,
        })
        class MyDirective {
          dependencyService = inject(DependencyService);
          count = adapt(0, {
            sources: this.dependencyService.forDirective.state$,
            signalPing,
          });

          constructor() {
            effect(() => this.count());

            inject(DestroyRef).onDestroy(() => {
              destroyed.directive = true;
            });
          }
        }

        @Component({
          selector: 'sa-doomed',
          providers: [Service],
          standalone: true,
          imports: [MyDirective],
          template: `
            <h2 saDirective>I'm doomed, but until then, here's {{ count() }}</h2>
          `,
        })
        class DoomedComponent {
          service = inject(Service);
          dependencyService = inject(DependencyService);
          count = adapt(0, {
            sources: this.dependencyService.forComponent.state$,
            signalPing,
          });

          constructor() {
            inject(DestroyRef).onDestroy(() => {
              destroyed.component = true;
            });
          }
        }

        @Component({
          selector: 'sa-parent',
          standalone: true,
          imports: [DoomedComponent],
          template: `
            <button (click)="toggleChildVisible()">Toggle</button>
            @if (childVisible()) {
              <sa-doomed />
            }
          `,
        })
        class ParentComponent {
          childVisible = signal(true);
          toggleChildVisible() {
            this.childVisible.set(!this.childVisible());
          }
        }

        TestBed.configureTestingModule({
          imports: [ParentComponent],
          providers: zoneless ? [provideExperimentalZonelessChangeDetection()] : [],
        }).compileComponents();

        const fixture = TestBed.createComponent(ParentComponent);
        fixture.detectChanges();

        return { fixture };
      };

      it(`should subscribe to shared dependency store on first read, then immediately unsubscribe on destroy, zoneless=${zoneless}, signalPing=${signalPing}`, fakeAsync(() => {
        const lifecycleCheckpoints = {
          component: 'initial',
          directive: 'initial',
          service: 'initial',
        };
        const destroyed = {
          component: false,
          directive: false,
          service: false,
        };
        const { fixture } = setup({
          destroyed: destroyed,
          getSources: (type: keyof typeof lifecycleCheckpoints) =>
            concat(
              of(0).pipe(
                tap(() => {
                  lifecycleCheckpoints[type] = 'subscribed';
                }),
              ),
              NEVER,
            ).pipe(
              finalize(() => {
                lifecycleCheckpoints[type] = 'unsubscribed';
              }),
            ),
        });

        expect(lifecycleCheckpoints).toEqual({
          component: 'subscribed',
          directive: 'subscribed',
          service: 'subscribed',
        });
        expect(destroyed).toEqual({
          component: false,
          directive: false,
          service: false,
        });

        const toggle = () => {
          fixture.nativeElement.querySelector('button').click();
          if (!zoneless) fixture.detectChanges();
        };

        tick(10_000);
        toggle();
        tick();
        expect(destroyed).toEqual({
          component: true,
          directive: true,
          service: true,
        });
        expect(lifecycleCheckpoints).toEqual({
          component: 'unsubscribed',
          directive: 'unsubscribed',
          service: 'unsubscribed',
        });
      }));
    });
    // Test local immediate cleanup
    // Test that shared service is using a ping. Tear down one component, then the other // Just check the timing of all of it.
    // For that matter, remove the filtering of undefined and test that timing too. Fix the bug if it still exists.
  });

  describe('store computeds', () => {
    it('should supply an efficient computed for each selector', () => {
      TestBed.configureTestingModule({});
      TestBed.runInInjectionContext(() => {
        let doubleCallCount = 0;

        const count = adapt(1, {
          selectors: {
            double: state => {
              doubleCallCount++;
              return state * 2;
            },
          },
        });

        expect(count()).toBe(1);
        expect(count.double()).toBe(2);
        expect(count.double()).toBe(2);
        expect(doubleCallCount).toBe(1);

        const quad = computed(() => count.double() * 2);
        expect(quad()).toBe(4);
        expect(doubleCallCount).toBe(1);
      });
    });

    it('should override signal function properties with selectors with same names', () => {
      TestBed.configureTestingModule({});
      TestBed.runInInjectionContext(() => {
        const count = adapt(1, {
          selectors: {
            toString: (state: number) => state, // toString is special apparently; needs type
            length: state => state?.toString(),
            name: state => state,
          },
        });

        const toString = count.toString();
        expect(toString).toBe(1);
        // @ts-expect-error: should be a number from selector
        const getToStringError = () => toString.split('');

        const length = count.length();
        expect(length).toBe('1');
        // @ts-expect-error: should be a string from selector
        const getLengthError = () => Math.pow(length, 2);

        const name = count.name();
        expect(name).toBe(1);
        // @ts-expect-error: should be a number from selector
        const getNameError = () => name.toUpperCase();
      });
    });
  });
});
