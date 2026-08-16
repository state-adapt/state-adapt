---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/adapt.context.ts#L29
---

# Variable: watch()

> `const` **watch**: \<`State`, `S`, `R`\>(`path`, `adapter`) => `SmartStore`\<`State`, `S` & `WithGetState`\<`State`\>\> = `defaultStateAdapt.watch`

Defined in: [react/src/lib/adapt.context.ts:29](https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/adapt.context.ts#L29)

Watches a store path using React's default StateAdapt configuration.

This function is bound to [defaultStateAdapt](defaultStateAdapt.md). For custom configuration,
export `watch` from the configured instance instead.

`watch` returns a detached store (doesn't chain off of sources). This allows you to watch state without affecting anything.
It takes 2 arguments: The path of the state you are interested in, and the adapter you want to use.

```tsx
watch(path, adapter)
```

path — Object path in Redux Devtools

adapter — Object with state change functions and selectors

### Usage

`watch` enables accessing state without subscribing to sources. For example, if your adapter manages the loading state
for an HTTP request and you need to know if the request is loading before the user is interested in the data,
`watch` can give you access to it without triggering the request.

#### Example: Accessing loading state

```tsx
watch('data', httpAdapter).loading$.subscribe(console.log);
```

## Type Parameters

### State

`State`

### S

`S` *extends* `Selectors`\<`State`\>

### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

## Parameters

### path

`string`

### adapter

[`Adapter`](../../core/src/Adapter.md)\<`State`, `S`, `R` & `BasicAdapterMethods`\<`State`\>\>

## Returns

`SmartStore`\<`State`, `S` & `WithGetState`\<`State`\>\>
