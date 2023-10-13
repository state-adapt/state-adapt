# @state-adapt/rxjs

## Peer Dependencies

[@state-adapt/core](/docs/core)

[rxjs](https://www.npmjs.com/package/rxjs)

## Global Configuration

[`ConfigureStateAdaptOptions`](/docs/rxjs#configurestateadaptoptions)

[`configureStateAdapt`](/docs/rxjs#configurestateadapt)

## Sources

[`Source`](/docs/rxjs#source)

[`toSource`](/docs/rxjs#tosource)

[`catchErrorSource`](/docs/rxjs#catcherrorsource)

[`toRequestSource`](/docs/rxjs#torequestsource)

[`splitSources`](/docs/rxjs#splitsources)

[`splitRequestSources`](/docs/rxjs#splitrequestsources)

[`getRequestSources`](/docs/rxjs#getrequestsources)

## Stores

[`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt)

[`StateAdapt.watch`](/docs/rxjs#stateadaptwatch)

[`joinStores`](/docs/rxjs#joinstores)

## Migration Guide

[2.0.0](/docs/rxjs#200)

<!-- ## Global Store -->

<!-- include: '../../../../../libs/rxjs/src/lib/global-store/configure-state-adapt.options.ts#ConfigureStateAdaptOptions' -->

<!-- include: '../../../../../libs/rxjs/src/lib/global-store/configure-state-adapt.function.ts#configureStateAdapt' -->

<!-- ## Sources -->

<!-- include: '../../../../../libs/rxjs/src/lib/sources/source.ts#Source' -->

<!-- include: '../../../../../libs/rxjs/src/lib/sources/to-source.operator.ts#toSource' -->

<!-- include: '../../../../../libs/rxjs/src/lib/sources/catch-error-source.operator.ts#catchErrorSource' -->

<!-- include: '../../../../../libs/rxjs/src/lib/sources/to-request-source.operator.ts#toRequestSource' -->

<!-- include: '../../../../../libs/rxjs/src/lib/sources/split-sources.function.ts#splitSources' -->

<!-- include: '../../../../../libs/rxjs/src/lib/sources/split-request-sources.function.ts#splitRequestSources' -->

<!-- include: '../../../../../libs/rxjs/src/lib/sources/get-request-sources.function.ts#getRequestSources' -->

<!-- ## Stores 1.2.0  -->

<!-- include: '../../../../../libs/rxjs/src/lib/global-store/state-adapt.ts#StateAdapt.adapt' -->

<!-- include: '../../../../../libs/rxjs/src/lib/global-store/state-adapt.ts#StateAdapt.watch' -->

<!-- include: '../../../../../libs/rxjs/src/lib/stores/join-stores.function.ts#joinStores' -->````

<!-- cache 20 -->

### 2.0.0

The 4 overloads of [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt) have been removed. Here is the new syntax for each overload:

#### `1. adapt(path, initialState)`

```typescript
// old
const count1 = adapt('count1', 4);

// new
const count1 = adapt(4);
```

#### `2. adapt([path, initialState], adapter)`

```typescript
// old
const count2_2 = adapt(['count2_2', 4], {
  increment: count => count + 1,
  selectors: {
    isEven: count => count % 2 === 0,
  },
});

// new
const count2_2 = adapt(4, {
  increment: count => count + 1,
  selectors: {
    isEven: count => count % 2 === 0,
  },
});
```

#### `3. adapt([path, initialState], sources)`

```typescript
// old
const count3 = adapt(
  ['count3', 4],
  http.get('/count/').pipe(toSource('http data')),
);

// new
const count3 = adapt(4, {
  sources: http.get('/count/').pipe(toSource('http data')),
});
```

#### `4. adapt([path, initialState, adapter], sources)`

```typescript
// old
const adapter4 = createAdapter<number>()({
  increment: count => count + 1,
  selectors: {
    isEven: count => count % 2 === 0,
  },
});
const count4 = adapt(['count4', 4, adapter4], watched => {
  return {
    set: watched.state$.pipe(delay(1000), toSource('tick$')),
  };
});

// new
const count4 = adapt(4, {
  adapter: {
    increment: count => count + 1,
    selectors: {
      isEven: count => count % 2 === 0,
    },
  },
  sources: watched => {
    return {
      set: watched.state$.pipe(delay(1000), toSource('tick$')),
    };
  },
  path: 'count4',
});
```

See [this GitHub issue](https://github.com/state-adapt/state-adapt/issues/45) for the reasons for this change.
