import {
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  InjectionToken,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { defer, NEVER } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { IS_STORE_LOCAL } from './is-store-local.token';
import { toSignal } from './to-signal.function';

describe('IS_STORE_LOCAL', () => {
  it('runs the strategy in the store creation injection context', () => {
    const LocalContext = new InjectionToken<boolean>('LocalContext');
    let subscriptions = 0;
    const injector = createEnvironmentInjector(
      [
        { provide: LocalContext, useValue: true },
        {
          provide: IS_STORE_LOCAL,
          useFactory: () => inject(LocalContext),
        },
      ],
      TestBed.inject(EnvironmentInjector),
    );

    runInInjectionContext(injector, () => {
      const value = toSignal(
        defer(() => {
          subscriptions++;
          return NEVER.pipe(finalize(() => subscriptions--));
        }),
        { initialValue: 0 },
      );

      expect(value()).toBe(0);
    });

    expect(subscriptions).toBe(1);

    injector.destroy();

    expect(subscriptions).toBe(0);
  });
});
