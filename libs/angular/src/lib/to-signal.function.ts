import {
  afterNextRender,
  ApplicationRef,
  computed,
  DestroyRef,
  inject,
  Injector,
  NgZone,
  signal,
  Signal,
  ViewContainerRef,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { createInitialStateGetter, InitialState } from '@state-adapt/rxjs';
import { IS_STORE_LOCAL } from './is-store-local.token';

export interface ToSignalOptions<State> {
  /** The value the signal returns until the source emits, and again after it unsubscribes. */
  initialValue: InitialState<State>;
}

/**
 * Converts an observable to a signal without keeping the source observable
 * subscribed to when no Angular consumer is reading the signal.
 *
 * Signals created in a component, directive, or locally provided service are
 * subscribed to immediately and unsubscribed from with that view. Signals created in a
 * root injection context are subscribed to only while a template or effect keeps
 * reading them.
 *
 * ### Example: Basic usage
 *
 * ```ts
 * const name = toSignal(name$, { initialValue: 'John' });
 * ```
 *
 * ### Example: Initial value factory
 *
 * `initialValue` can be a function that returns the value. The signal calls it when it
 * subscribes, keeps that value until it unsubscribes, and discards it then — so the factory
 * runs again for each subscription.
 *
 * This helps when the initial value might be different at each time the signal is being used,
 * like with `localStorage`:
 *
 * ```ts
 * const name = toSignal(name$, {
 *   initialValue: () => localStorage.getItem('name') ?? 'John',
 * });
 * ```
 *
 * A read while the signal is unsubscribed will not use a cached value, but call the factory function.
 */
export function toSignal<State>(
  source$: Observable<State>,
  { initialValue }: ToSignalOptions<State>,
): Signal<State> {
  const destroyRef = inject(DestroyRef);
  const version = signal(0);
  const noError = {};
  const unset = {};
  const getInitialValue = createInitialStateGetter(initialValue);
  let currentValue: State | typeof unset = unset;
  const getCurrentValue = () =>
    currentValue === unset ? getInitialValue() : (currentValue as State);
  let currentError: unknown = noError;
  let subscription: Subscription | undefined;
  let active = false;

  const subscribe = () => {
    if (active) return;
    active = true;

    subscription = source$.subscribe({
      next: value => {
        currentValue = value;
        currentError = noError;
        version.update(valueVersion => valueVersion + 1);
      },
      error: error => {
        currentError = error;
        version.update(valueVersion => valueVersion + 1);
      },
    });

    // After subscribing, so a source that activates with it has already created its own
    // initial state for this session rather than being asked for a one-off value
    getInitialValue.activate();
  };

  const unsubscribe = () => {
    active = false;
    subscription?.unsubscribe();
    subscription = undefined;
    currentValue = unset;
    currentError = noError;
    getInitialValue.deactivate();
  };

  const isLocal =
    inject(IS_STORE_LOCAL, { optional: true }) ??
    !!inject(ViewContainerRef, { optional: true });
  if (isLocal) {
    subscribe();
    destroyRef.onDestroy(unsubscribe);

    return computed(() => {
      version();
      if (currentError !== noError) throw currentError;
      return getCurrentValue();
    });
  }

  const strategy = getRootConsumerStrategy(
    inject(ApplicationRef),
    inject(Injector),
    inject(NgZone),
  );
  const entry: RootSignalEntry = {
    wasRead: false,
    invalidate: () => version.update(valueVersion => valueVersion + 1),
    activate: subscribe,
    deactivate: unsubscribe,
  };

  const state = computed(() => {
    version();
    entry.wasRead = true;
    strategy.track(entry);
    if (currentError !== noError) throw currentError;
    return getCurrentValue();
  });

  destroyRef.onDestroy(() => {
    strategy.remove(entry);
    unsubscribe();
  });

  return state;
}

interface RootSignalEntry {
  wasRead: boolean;
  invalidate(): void;
  activate(): void;
  deactivate(): void;
}

const rootStrategies = new WeakMap<ApplicationRef, RootConsumerStrategy>();

function getRootConsumerStrategy(
  applicationRef: ApplicationRef,
  injector: Injector,
  zone: NgZone,
): RootConsumerStrategy {
  let strategy = rootStrategies.get(applicationRef);
  if (!strategy) {
    strategy = new RootConsumerStrategy(applicationRef, injector, zone);
    rootStrategies.set(applicationRef, strategy);
  }
  return strategy;
}

class RootConsumerStrategy {
  private readonly entries = new Set<RootSignalEntry>();
  private afterRenderScheduled = false;
  private probing = false;
  private coolingDown = false;

  constructor(
    private readonly applicationRef: ApplicationRef,
    private readonly injector: Injector,
    private readonly zone: NgZone,
  ) {}

  track(entry: RootSignalEntry): void {
    this.entries.add(entry);
    if (!this.probing && !this.coolingDown) this.scheduleAfterRenderProbe();
  }

  remove(entry: RootSignalEntry): void {
    this.entries.delete(entry);
  }

  private scheduleAfterRenderProbe(): void {
    if (this.afterRenderScheduled || this.entries.size === 0) return;
    this.afterRenderScheduled = true;

    afterNextRender(
      {
        read: () => {
          this.afterRenderScheduled = false;
          this.zone.runOutsideAngular(() => {
            // Let microtasks queued by rendering and effects stabilize before
            // taking a clean snapshot of the signal consumer graph.
            queueMicrotask(() => queueMicrotask(() => this.probe()));
          });
        },
      },
      { injector: this.injector },
    );
  }

  private probe(): void {
    if (this.entries.size === 0) return;

    this.probing = true;
    let candidates: RootSignalEntry[];
    try {
      // Flush work that became dirty after the render which scheduled us.
      this.applicationRef.tick();

      candidates = [...this.entries];
      for (const entry of candidates) {
        entry.wasRead = false;
        entry.invalidate();
      }

      // Persistent template/effect consumers re-read their invalidated signal.
      this.applicationRef.tick();
    } catch (error) {
      this.probing = false;
      throw error;
    }

    // Angular versions differ in exactly when application effects flush. Give
    // effects queued by the ping tick one microtask before taking attendance.
    queueMicrotask(() => this.finishProbe(candidates));
  }

  private finishProbe(candidates: RootSignalEntry[]): void {
    for (const entry of candidates) {
      if (!this.entries.has(entry)) {
        entry.deactivate();
        continue;
      }
      if (entry.wasRead) {
        entry.activate();
      } else {
        entry.deactivate();
        this.entries.delete(entry);

        // Leave the computed dirty so a later read can register it again.
        entry.invalidate();
      }
    }
    this.probing = false;

    // Signal invalidation can enqueue Angular's own follow-up render. Rearm one
    // microtask after accounting so that render cannot be mistaken for a new
    // external one.
    this.coolingDown = true;
    this.zone.runOutsideAngular(() => {
      queueMicrotask(() => {
        this.coolingDown = false;
        this.scheduleAfterRenderProbe();
      });
    });
  }
}
