---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/watch.function.ts#L59
---

# Function: watch()

> **watch**\<`State`, `S`, `R`\>(`path`, `adapter?`): \{ \[P in string \| number \| symbol as \`$\{P extends string ? P\<P\> : never\}$\`\]: Observable\<ReturnType\<(S & WithGetState\<State\>)\[P\]\>\> \} & `object` & `object` & () => `undefined` \| `State` & `object` & \{ \[K in string \| number \| symbol\]: Signal\<undefined \| ReturnType\<S\[K\]\>\> \}

Defined in: [libs/angular/src/lib/watch.function.ts:59](https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/watch.function.ts#L59)

`watch` wraps [StateAdapt.watch](../../rxjs/index/StateAdapt.md#watch) for Angular and adds signals for the store's selectors.

`watch` returns a detached store (doesn't chain off of sources). This allows you to watch state without affecting anything.
Its signals are `undefined` until the watched path becomes active, then mirror its latest state without activating its sources.
It takes the path of the state you are interested in and, optionally, the adapter containing the selectors you want to use.

```ts
watch(path, adapter)
```

path — Object path in Redux Devtools

adapter — Optional object with state change functions and selectors. When omitted, `watch` uses the base adapter.

### Usage

`watch` enables accessing state without subscribing to sources. For example, if your adapter manages the loading state
for an HTTP request and you need to know if the request is loading before the user is interested in the data,
`watch` can give you access to it without triggering the request.

#### Example: Accessing loading state

```ts
@Component({
  template: `
    @if (data.loading()) {
      <sa-spinner />
    }
  `,
})
export class MyComponent {
  // Reads the loading state of the 'data' store
  // without activating it or triggering the request
  data = watch('data', httpAdapter);
}
```

## Type Parameters

### State

`State` = `any`

### S

`S` *extends* `Selectors`\<`State`\> = \{ \}

### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\> = \{ \}

## Parameters

### path

`string`

### adapter?

[`Adapter`](../../core/src/Adapter.md)\<`State`, `S`, `R` & `BasicAdapterMethods`\<`State`\>\>

## Returns
