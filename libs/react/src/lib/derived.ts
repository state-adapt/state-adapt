import {
  createSelectorsCache,
  memoizeWithProxy,
  SelectorsCache,
} from '@state-adapt/core';
import { StoreLike } from '@state-adapt/rxjs';

interface StoreDependency {
  store: StoreLike<any, any, any>;
  fullSelector: (globalState: any, cache?: SelectorsCache) => any;
}

interface SelectorDependency {
  key: string;
  select: (globalState: any, cache?: SelectorsCache) => any;
}

interface ProjectorContext {
  read: (dependency: SelectorDependency) => any;
}

/**
 * A shared, memoized value created with {@link derive}. Call it for its current
 * value, or pass it to {@link useDerived}.
 *
 * @hidden
 */
export interface Derived<Value> {
  (): Value;
  /** @internal */
  __: {
    fullSelector: (globalState?: any, cache?: SelectorsCache) => Value;
  };
}

export interface DerivedConsumer {
  consume(store: StoreLike<any, any, any>): void;
}

const projectorContexts: ProjectorContext[] = [];
const consumerContexts: DerivedConsumer[] = [];
let dependencyId = 0;

const getProjectorContext = () => projectorContexts[projectorContexts.length - 1];
const getConsumerContext = () => consumerContexts[consumerContexts.length - 1];

export const withDerivedConsumer = <Value>(
  consumer: DerivedConsumer,
  read: () => Value,
): Value => {
  consumerContexts.push(consumer);
  try {
    return read();
  } finally {
    consumerContexts.pop();
  }
};

const readDependency = (dependency: SelectorDependency) => {
  const context = getProjectorContext();
  return context ? context.read(dependency) : dependency.select(undefined);
};

export const createStoreSelectorReader = (
  store: StoreLike<any, any, any>,
  fullSelector: (globalState: any, cache?: SelectorsCache) => any,
  isUnavailable: () => boolean = () => false,
) => {
  const dependency: StoreDependency & SelectorDependency = {
    store,
    key: `storeSelector${dependencyId++}`,
    select: (globalState: any, cache?: SelectorsCache) => {
      getConsumerContext()?.consume(store);
      if (isUnavailable()) return undefined;
      return fullSelector(
        globalState === undefined ? store.__.getGlobalState() : globalState,
        cache,
      );
    },
    fullSelector,
  };

  return () => readDependency(dependency);
};

/**
 * Creates a shared, memoized value derived from stores created with
 * {@link adapt}. Call it for its current value, or subscribe a component to it
 * with {@link useDerived}.
 *
 * Define it outside your components:
 *
 * ```tsx
 * const priceStore = adapt(20);
 * const quantityStore = adapt(3);
 *
 * const deriveSubtotal = derive(() => priceStore() * quantityStore());
 * const deriveTotal = derive(() => deriveSubtotal() + 5);
 *
 * function Total() {
 *   const total = useDerived(deriveTotal);
 *
 *   return <p>Total: {total}</p>;
 * }
 * ```
 */
export function derive<Value>(projector: () => Value): Derived<Value> {
  const dependencySelectors: Record<
    string,
    (globalState: any, cache?: SelectorsCache) => any
  > = {};
  const selectorsCache = createSelectorsCache();
  const key = `derived${dependencyId++}`;

  const fullSelector = memoizeWithProxy<any>()(
    key,
    dependencySelectors,
    proxy => {
      const context: ProjectorContext = {
        read: dependency => {
          dependencySelectors[dependency.key] = dependency.select;
          return (proxy as any)[dependency.key];
        },
      };

      projectorContexts.push(context);
      try {
        return projector();
      } finally {
        projectorContexts.pop();
      }
    },
    () => selectorsCache,
  );

  const dependency: SelectorDependency = {
    key,
    select: fullSelector,
  };
  const derived = (() => readDependency(dependency)) as Derived<Value>;
  derived.__ = { fullSelector };
  return derived;
}
