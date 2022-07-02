# Thinking Reactively

StateAdapt enables completely reactive state management. Although each team should determine for themselves how much they want to commit to reactive architecture, we believe that functional reactive programming will increasingly become the dominant pattern for most nontrivial apps.

## Reactive code is better

Function reactive programming creates apps that are less bug-prone because they respect separation of concerns: Rather than organizing code by the timing of its execution, it organizes code by what feature it changes.

## It takes practice

Reactive programming is not harder, it is just different. Thinking reactively takes practice. Experienced developers will have strong imperative habits, including using callback functions for events and reaching from outside of features to tell them how to change. However, with practice, it will become easier and easier to think reactively.

---

## Try this process

Until experienced developers have overcome the habits of imperative programming, we recommend the following process, which should reduce the cognitive load of trying to think both reactively and imperatively. After trying it you may find a different process more helpful, and that is fine.

### 1. Define sources

Sources are only concerned with representing an event. This makes them extremely simple to start with.

What if the event data ends up not being emitted in the exact shape we want it? That is the concern of the consumers, not the source. Sources are at the very top; everything else is downstream.

### 2. Choose an adapter

How should state change in response to the sources you just created? Is this state pattern something you have seen before? Try to reuse state adapters where possible, but if you can't, create a new adapter to handle those state changes.

State changes are the place you want to handle discrepancies between the structure of data emitted from sources and how you want your state to be shaped. Do not let sources dictate the shape of your state if there is a conflict between what makes sense and what just happens when you dump the source payloads into the state. Your state shape should be clear, minimal and performant for selectors to access.

### 3. Create a store

Define the initial state and create a store with the adapter.

### 4. Make selectors (if needed)

Define selectors in the adapter to maximize convenience for consumers. Selectors are the perfect place to create the exact data shape the consumers want. For example, if the state needs to end up in a template, consider creating a selector that maps the state into the most convenient structure to be consumed by HTML. Always try to put logic in adapters, because they are collections of pure functions, which are extremely nice to test and reuse. Pulling synchronous code out of RxJS pipes also makes it easier to follow the asynchronous logic.

You can also [combine selectors between stores](/concepts/stores#joining-stores) if needed.

### 5. Repeat

Repeat the process.

Some sources require state from other stores. For example, if you are creating a filtered list, you need the filter state in order to make the request to the server for the filtered items. You will probably want to create a selector in the required filter adapter to get the data in the exact format you want.

Some sources need to access state from the same store they will be used in. This creates a circular reference, so the solution is to use [`watch`](/concepts/stores#watch).
