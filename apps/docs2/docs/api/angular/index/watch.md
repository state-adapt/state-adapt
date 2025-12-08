---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/watch.function.ts#L34
---

# Variable: watch

> `const` **watch**: [`StateAdapt`](../../rxjs/index/StateAdapt.md)\[`"watch"`\]

Defined in: [lib/watch.function.ts:34](https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/watch.function.ts#L34)

`watch` wraps [StateAdapt.watch](../../rxjs/index/StateAdapt.md#watch) for Angular.

`watch` returns a detached store (doesn't chain off of sources). This allows you to watch state without affecting anything.
It takes 2 arguments: The path of the state you are interested in, and the adapter containing the selectors you want to use.

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
