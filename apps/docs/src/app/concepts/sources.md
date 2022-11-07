# Sources

- [Overview](/concepts/sources#overview)
- [Events, not commands](/concepts/sources#events-not-commands)
- [`toSource`](/concepts/sources#tosource)
- [`Source`](/concepts/sources#source)
- [`splitSources`](/concepts/sources#splitsources)
- [`getAction`](/concepts/sources#getaction)
- [`getHttpActions`](/concepts/sources#gethttpactions)
- [`splitHttpSources`](/concepts/sources#splithttpsources)
- [`getHttpSources`](/concepts/sources#gethttpsources)
- [One Source per Event](/concepts/sources#one-source-per-event)
- [Synthetic Sources](/concepts/sources#synthetic-sources)

## Overview

Sources are where asynchronous data enters applications. Examples are

- user input
- data arriving from a server
- a timer completing

There are 3 types of sources:

- Sources created from existing observables
- Sources created from the [`Source`](/concepts/sources#source) class (similar to RxJS `Subject`)
- Default sources made available when stores are created, called ["Synthetic Sources"](/concepts/sources#synthetic-sources)

## Events, not commands

Sources should be named after events, not commands. For example, rather than naming a source `changeName$`, consider naming it `nameChange$` or `nameChanged$`. In reactive programming, data flows in one direction, and giving a source the name of a command puts implicit knowledge about what happens _downstream_ from the source into the source itself. It is a subtle but important change of mindset from traditional, imperative programming.

This isn't an absolute rule. For example, [synthetic sources](/concepts/sources#synthetic-sources) are an exception to this. But in general, this rule should be followed.

## `toSource`

[`toSource`](/concepts/sources#tosource) is an observable operator that converts an existing observable into a source. It takes one argument: the action type that will be displayed in Redux Devtools.

Example:

```typescript
import { timer } from 'rxjs';
import { toSource } from '@state-adapt/rxjs';

const timer$ = timer(3000).pipe(toSource('timer$'));
```

![Action Type in Redux Devtools](../assets/timer$.png)

(Note: This will not occur until you use the source in a store and subscribe to its state.)

Internally, `toSource` just maps values to action objects that are similar to Redux actions.

## `Source`

When you don't have an observable already, you can use a [`Source`](/concepts/sources#source) the same way you would use an RxJS `Subject`:

```typescript
import { Source } from '@state-adapt/rxjs';
// ...
formSubmission$ = new Source<void>('formSubmission$');
```

```html
<button (click)="formSubmission$.next()">Submit</button>
```

The argument is the action type that will show up in Redux Devtools.

Similar to [`toSource`](/concepts/sources#tosource), values pushed into [`Source`](/concepts/sources#source) will be wrapped in objects similar to Redux actions.

## `splitSources`

Some observables are actually several event types merged together. Although it will depend on how you write your state adapters, you will probably want only one event type per source. You could just `filter` for each event type and then use [`toSource`](/concepts/sources#tosource) on each filtered stream, but StateAdapt provides a [`splitSources`](/concepts/sources#splitsources) function that might help. Here is how it can be used:

```typescript
import { Observable } from 'rxjs';
import { splitSources } from '@state-adapt/rxjs';

enum MessageType {
  MESSAGE_1 = 'MESSAGE_1',
  MESSAGE_2 = 'MESSAGE_2',
}

interface Message1 {
  type: MessageType.MESSAGE_1;
}

interface Message2 {
  type: MessageType.MESSAGE_2;
  data: string;
}

type WebsocketMessage = Message1 | Message2;

const websocketMessages$: Observable<WebsocketMessage> = of(
  Math.random() < 0.5
    ? { type: MessageType.MESSAGE_1 }
    : { type: MessageType.MESSAGE_2, data: 'asdfasdf' }
);

const { message1$, message2$ } = splitSources(websocketMessages$, {
  message1$: MessageType.MESSAGE_1, // matches against message.type
  message2$: MessageType.MESSAGE_2,
});

// Correctly infers the type of message1$ as Observable<Message1>
// You can now apply toSource to each stream,
// if the stream wasn't already of type
// Observable<{type: string, payload: Payload}>
```

Since [`splitSources`](/concepts/sources#splitsources) matches against the `type` property of the values emitted from the observable passed into it, you can easily pass in an observable of actual StateAdapt sources and they will come out the other side as sources still. However, when all the messages in the input observable do _not_ fit the StateAdapt/Redux `Action` interface, you will have to use [`toSource`](/concepts/sources#tosource) to convert them, as mentioned in that example.

## `getAction`

This is a function that takes in 2 arguments (an `actionType` and an optional `payload`) and creates a StateAdapt `Action`. So, in this example `source1$` and `source2$` are equivalent:

```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getAction } from '@state-adapt/core';
import { toSource } from '@state-adapt/rxjs';

const obs$ = of(1);
const source1$ = obs$.pipe(toSource('source1$'));
const source2$ = obs$.pipe(map(n => getAction('source$2', n)));
```

## `getHttpActions`

HTTP requests are often just used for the single value they emit when they complete. However, if you want to handle the loading state and errors, http requests become a common example of observables that contain multiple event types in a single observable: `request`, `error` and `success`. `getHttpActions` uses [`getAction`](/concepts/sources#getaction) internally to convert an HTTP request observable into an observable of those 3 actions. Example usage:

```typescript
import { getHttpActions } from '@state-adapt/rxjs';

const fetchData = (filters: Filters) =>
  timer(2000).pipe(mapTo({ body: 'Some data', status: 200, error: null }));

const httpActions$ = filters$.pipe(
  // filters$ is just some observable of filters that triggers re-fetch
  switchMap(filters =>
    getHttpActions(
      fetchData(filters),
      res => [res.status === 200, res.body, res.error],
      filters
    )
  )
);
```

The 1st argument of [`getHttpActions`](/concepts/sources#gethttpactions) is the HTTP observable.

The 2nd argument is a function that takes in the value emitted by the HTTP observable and returns an array with 3 elements:

1. A boolean that is true if the request was successful
2. The value you want as the payload of the `Success` action
3. The error message from the response

[`getHttpActions`](/concepts/sources#gethttpactions) also applies a `catchError` RxJS operator and maps it to the `Error` source, so the type emitted by the `Error` source is `string | Err`, where `Err` is whatever you typed it as in your observable.

The 3rd argument is optional and will be part of the `request$` and `error$` actions. If you provide this argument, then whatever you provided for the error in the 2nd argument will end up getting wrapped in an array with it. So in this example, the error action payload would be of type `[string | typeof res.error, Filters]`, and the request action payload would be `Filters` instead of `void`. If you didn't provide a 3rd argument, the error action payload would be of type `string | typeof res.error` and the request action payload would be `void`.

Typically you will call [`splitHttpSources`](/concepts/sources#splitsources) after [`getHttpActions`](/concepts/sources#gethttpactions) to split it into 3 separate sources: `request$`, `success$` and `error$`.

But for many HTTP sources you will not have to use [`getHttpActions`](/concepts/sources#gethttpactions) directly. If you are creating an inner observable, you will probably use it, because each new request needs to start with a `request$` action. However, if you are not creating an inner observable, you can just use [`getHttpSources`](/concepts/sources#gethttpsources), which combines [`getHttpActions`](/concepts/sources#gethttpactions) and [`splitHttpSources`](/concepts/sources#splithttpsources).

## `splitHttpSources`

The 1st argument is the scope. Whatever you pass in here, [`splitHttpSources`](/concepts/sources#splithttpsources) will append `' request$'`, `' success$'` and `' error$'` to it in the actions that it creates with [`getAction`](/concepts/sources#getaction). So if you pass in `'[Some Data]'`, the action types of the sources will be `'[Some Data] request$'`, `'[Some Data] success$'` and `'[Some Data] error$'`.

The 2nd argument is the observable of all HTTP actions, which is what [`getHttpActions`](/concepts/sources#gethttpactions) returns.

## `getHttpSources`

[`getHttpSources`](/concepts/sources#gethttpsources) is a combination of [`getHttpActions`](/concepts/sources#gethttpactions) and [`splitHttpSources`](/concepts/sources#splithttpsources). Here is an example of two ways that are equivalent:

```typescript
import {
  getHttpActions,
  splitSources,
  getHttpSources,
} from '@state-adapt/rxjs';

const fetchData = () =>
  timer(2000).pipe(mapTo({ body: 'Some data', status: 200, error: null }));

// 1. getHttpActions + splitSources
const httpActions$ = getHttpActions(fetchData(), res => [
  res.status === 200,
  res.body,
  res.error,
]);
const { request$, success$, error$ } = splitHttpSources(
  '[Some Data]',
  httpActions$
);

// 2. getHttpSoures
const { request$, success$, error$ } = getHttpSources(
  '[Some Data]',
  fetchData(),
  res => [res.status === 200, res.body, res.error]
);
```

## One Source per Event

In reactive programming, data flows in one direction, so each source represents a single kind of event. Rather than handling an event in a callback function, you should directly push the event into a single source and handle downstream effects in the affected features themselves.

Bad example:

```html
<!-- DO NOT DO THIS -->
<button (click)="onFormSubmit()">Submit</button>
```

```typescript
import { Source } from '@state-adapt/rxjs';
// ... DO NOT DO THIS
submitForm$ = new Source<FormData>('submitForm$');
resetForm$ = new Source<void>('resetForm$');
// ... DO NOT DO THIS
onFormSubmit() {
  this.submitForm$.next(this.form.value);
  this.resetForm$.next();
}
```

Good example:

```html
<!-- DO THIS -->
<button (click)="formSubmission$.next()">Submit</button>
```

```typescript
import { Source } from '@state-adapt/rxjs';
// ... DO THIS
formSubmission$ = new Source<void>('formSubmission$'); // or formSubmitted$
```

There might be numerous states that are impacted by a single event. You should still only create a single source for this event and handle downstream effects in the affected features themselves.

Internally, StateAdapt checks each source you pass into the `init` method to see if you have passed it into the `init` method at any time before. If you have, it doesn't subscribe to the same source again; it just adds its state changes to the list of state changes to apply whenever the first source emits. The action type is only used for annotation, so only the same observable references will be treated the same.

The benefit of doing it this way is that you only see one action dispatched in Redux Devtools for each event that occurs in the app, no matter how many stores are listening to it. They all get piled onto the same action for Redux Devtools.

The drawback is rare, but it does occur: Since we only subscribe to the first observable, cold observables like those created from `of` and `timer` that you would expect to fire for each individual store that uses them will actually only fire for the first store that uses that exact observable reference. The solution? Just create a new reference for each store that uses it. This can be achieved either through a factory function, such as `getTimer = () => timer(5000)`, or by wrapping the reference in a `defer()` when passing it into another store (simply calling `.pipe()` on an observable doesn't seem to create a new reference, so that doesn't work). There might be a more clever workaround, but these work. This situation is rare and the benefit of having 1 action in Redux Devtools per event is well worth this drawback. But it is good to know about so you can deal with it when you come across it.

## Synthetic Sources

Every store creates synthetic sources from the state change functions defined in its adapter. So if you had an adapter and a store like these:

```tsx
adapter = createAdapter<number>()({
  increment: state => state + 1,
});
numberStore = adapt(['number', 0], this.adapter);
```

You could trigger the synthetic source created for the `increment` state change by simply calling `numberStore.increment()`:

```html
<button (click)="numberStore.increment()">Increment</button>
```

This is no more imperative than using a normal [`Source`](/concepts/sources#source):

```html
<button (click)="increment$.next()">Increment</button>
```

The difference is the synthetic source is implicitly defined when the store is created, whereas the traditional [`Source`](/concepts/sources#source) is created explicitly, like this:

```tsx
increment$ = new Source<number>('increment$');
// ... use in a store
```

In both cases, the template is making an imperative call: `numberStore.increment()` vs `increment$.next()`.

There is no cost to using synthetic sources when first developing a feature, since the syntax is low-commitment and easy to change later.

As soon as multiple stores need to react to any event, we should define an independent [`Source`](/concepts/sources#source). No single store owns that source anymore, so it needs to be defined independently.

So if we wanted 2 stores to increment when the button is clicked, instead of this:

```html
<!-- DON'T DO THIS -->
<button (click)="numberStore1.increment(); numberStore2.increment()">
  Increment
</button>
```

or this:

```html
<!-- DON'T DO THIS -->
<button (click)="incrementBothStores()">Increment</button>
```

```tsx
// DON'T DO THIS
incrementBothStores() {
  this.numberStore1.increment();
  this.numberStore2.increment();
}
```

We should create an independent source and have both stores react to it:

```tsx
adapter = createAdapter<number>()({
  increment: state => state + 1,
});

incrementBoth$ = new Source<number>('incrementBoth$');

numberStore1 = adapt(['number1', 0, this.adapter], {
  increment: this.increment$,
});
numberStore2 = adapt(['number2', 0, this.adapter], {
  increment: this.increment$,
});
```

```html
<button (click)="incrementBoth$.next()">Increment</button>
```

This reduces imperative code and makes the store declarations themselves as complete and self-determining as possible.

A simple general rule to follow is this: [Don't write callback functions](https://dev.to/this-is-angular/simple-derived-state-progressive-reactivity-in-angular-48oe) (or event handlers). They are just containers for imperative code. Instead, push a minimal update from the template to a single place in TypeScript, and let everything downstream take responsibility for itself and react if necessary.
