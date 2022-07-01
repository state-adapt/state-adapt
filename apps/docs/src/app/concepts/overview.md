# StateAdapt Conceptual Overview

StateAdapt has 3 main concepts: Sources, adapters and stores.

## [Sources](/concepts/sources)

[Sources](/concepts/sources) are where asynchronous data enters applications. Examples are

- User input
- Data arriving from a server
- A timer completing

## [Adapters](/concepts/adapters)

[Adapters](/concepts/adapters) are objects containing 2 kinds of reusable state management patterns:

- State changes (pure functions that implement ways state can change)
- Selectors (pure functions that calculate derived state or just return a specific piece of state)

## [Stores](/concepts/stores)

[Stores](/concepts/stores) do 4 things:

- Define initial state and an adapter to manage it
- Connect sources to adapter state changes
- Use the adapter's selectors to create observables of the selectors' results. These observables chain off the sources so subscriptions are propagated
- Use the adapter's state changes to create synthetic sources for simple, single-store state changes. These are made available as part of the store, so DOM event handlers can call them. See [Synthetic Sources](/concepts/sources#synthetic-sources).
