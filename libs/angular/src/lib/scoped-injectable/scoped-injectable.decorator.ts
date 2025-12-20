import {
  inject,
  InjectionToken,
  Injector,
  Provider,
  runInInjectionContext,
  Type,
} from '@angular/core';

const SCOPED_REGISTRY = new Map<InjectionToken<any>, () => any>();

let tokenId = 0;

/**
 * @experimental
 * Creates a token for a scoped injectable
 */
export function createScopedToken<T = unknown>(name?: string) {
  const factory = () => {
    const injector = inject(Injector);
    const factory = SCOPED_REGISTRY.get(token);
    if (!factory) {
      throw new Error('No factory registered for scoped service.');
    }
    return runInInjectionContext(injector, factory);
  };

  const token = new InjectionToken<T>(name ?? 'Scoped Service - ' + tokenId++, {
    factory,
  });

  const provider: Provider = {
    provide: token,
    useFactory: factory,
  };

  return { token, provider };
}

function scopedInjectable<T>(token: InjectionToken<any>, factory: () => any): Type<T> {
  if (SCOPED_REGISTRY.has(token)) {
    throw new Error('Factory already registered for scoped service.');
  }
  SCOPED_REGISTRY.set(token, factory);
  return token as any;
}

/**
 * @experimental
 * Decorator to define a scoped injectable service
 */
export function ScopedInjectable({ providedIn }: { providedIn: InjectionToken<any> }) {
  return function decorator(target: any) {
    return scopedInjectable(providedIn, () => new target()) as any;
  };
}
