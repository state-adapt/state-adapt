# StackBlitz Examples

These are the Angular demo apps in the [StateAdapt repo](https://github.com/state-adapt/state-adapt). Each StackBlitz link opens the whole monorepo in a WebContainer and starts that app.

Run the same commands locally from the repo root.

## Counter

A few counters that share UI and adapters. Stores are created in the component and in services.

```sh
npm run demo:counter
```

[Open in StackBlitz](https://stackblitz.com/github/state-adapt/state-adapt?preset=node&startScript=demo:counter&file=apps%2Fng-sa-counter%2Fsrc%2Fapp%2Fapp.component.ts)

## Shopping

A product catalog, cart, and filters. `joinStores` combines the product and filter stores so the list reacts to the active filters.

```sh
npm run demo:shopping
```

[Open in StackBlitz](https://stackblitz.com/github/state-adapt/state-adapt?preset=node&startScript=demo:shopping&file=apps%2Fng-sa-shopping%2Fsrc%2Fapp%2Fproducts%2Fproduct.service.ts)
