# Sources

- [Overview](/concepts/sources#overview)
- [`toSource`](/concepts/sources#tosource)
- [`Source`](/concepts/sources#source)
- [`splitSources`](/concepts/sources#splitsources)
- [`getAction`](/concepts/sources#getaction)
- [`getHttpSources`](/concepts/sources#gethttpsources)
- [Reusing Sources](/concepts/sources#reusing-sources)

# Overview

Sources are where asynchronous data enters applications. Examples are

- user input
- data arriving from a server
- a timer completing

There are 2 types of sources: Sources created from existing observables, and sources created from the `Source` class (similar to RxJS `Subject`).

Sources should be named after events, not commands. For example, rather than naming a source `changeName$`, consider naming it `nameChange$` or `nameChanged$`. In reactive programming, data flows in one direction, and giving a source the name of a command puts implicit knowledge about what happens _downstream_ from the source into the source itself. It is a subtle but important change of mindset from traditional, imperative programming.

# `toSource`

`toSource` is an observable operator that converts an existing observable into a source. It takes one argument: the action type that will be displayed in Redux Devtools. The only purpose of the action type is to appear in Redux Devtools to help developers understand what is taking place in the application, so you can name it whatever you want.

Example:

```typescript
import { timer } from 'rxjs';
import { toSource } from '@state-adapt/core';

const timer$ = timer(3000).pipe(toSource('timer$'));
```

![Action Type in Redux Devtools](../assets/timer$.png)

(Note: This will not occur until you use the source in a store and subscribe to its state.)

Internally, `toSource` just maps values to action objects that are similar to Redux actions. While you can technically interact with these objects, we discourage doing so, both to encourage reactive patterns and to avoid depending too much on the internal implementation of StateAdapt.

# `Source`

When you don't have an observable already, you can use a `Source` the same way you would use an RxJS `Subject`. The most common use case for this is to represent user input in a component:

```html
<button (click)="formSubmission$.next()">Submit</button>
```

```typescript
import { Source } from '@state-adapt/core';
// ...
formSubmission$ = new Source<void>('formSubmission$');
```

The argument is the action type that will show up in Redux Devtools.

Similar to `toSource`, `Source` wraps values pushed into it in objects similar to Redux actions.

# `splitSources`

Some observables are actually several event types merged together. Although it will depend on how you write your state adapters, you will probably want only one event type per source. You could just `filter` for each event type and then use `toSource` on each filtered stream, but StateAdapt provides a `splitSources` function that might help. Here is how it can be used:

```typescript
import { Observable } from 'rxjs';
import { splitSources } from '@state-adapt/core';

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
    : { type: MessageType.MESSAGE_2, data: 'asdfasdf' },
);

const { message1$, message2$ } = splitSources(websocketMessages$, {
  message1$: MessageType.MESSAGE_1, // matches against message.type
  message2$: MessageType.MESSAGE_2,
});

// Correctly infers the type of message1$ as Observable<Message1>
// You can now apply toSource to each stream
```

Since `splitSources` matches against the `type` property of the values emitted from the observable passed into it, you can easily pass in an observable of actual StateAdapt sources and they will come out the other side as sources still. However, when all the messages in the input observable do _not_ fit the StateAdapt/Redux `Action` interface, you will have to use `toSource` to convert them, as mentioned in that example.

# `getAction`

This is a function that takes in 2 arguments (an `actionType` and an optional `payload`) and creates a StateAdapt `Action`. So, in this example `source1$` and `source2$` are equivalent:

```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSource, getAction } from '@state-adapt/core';

const obs$ = of(1);
const source1$ = obs$.pipe(toSource('source1$'));
const source2$ = obs$.pipe(map(n => getAction('source$2', n)));
```

This can give you a little more flexibility when creating sources.

# `getHttpSources`

Http requests are often just used for the single value they emit when they complete. However, if you want to handle the loading state and errors, http requests become a common example of an observable that contains multiple event types in a single observable: `request`, `error` and `success`. getHttpSources uses `getAction` and `splitSources` internally to split an http request observable into those 3 common sources. Example usage:

```typescript
import { getHttpSources } from '@state-adapt/core';

const fetchData = () =>
  timer(2000).pipe(mapTo({ body: 'Some data', status: 200, error: null }));

const { request$, success$, error$ } = getHttpSources(
  '[Some Data]',
  fetchData(),
  res => [res.status === 200, res.body, res.error],
);
```

There is a lot going on here.

The first argument is the scope. Whatever you pass in here, `getHttpSources` will append `' Request'`, `' Success'` or `' Error'` to the actions that it uses `getAction` to create. So if you pass in `'[Some Data]'`, the action types of the sources will be `'[Some Data] Request'`, `'[Some Data] Success'` and `'[Some Data] Error'`.

The 2nd argument is an observable (the http request).

The 3rd argument is a function you need to provide that takes in the value emitted by the observable passed in argument 2 and returns an array containing 3 elements:

1. A boolean that is true if the request was successful
2. The value you want as the payload of the `Success` action
3. The error message from the response

`getHttpSources` also applies a `catchError` RxJS operator and maps it to the `Error` source, so the type emitted by the `Error` source is `string | Err`, where `Err` is whatever you typed it as in your observable.

# Reusing Sources

In reactive programming, data flows in one direction, so each source represents a single kind of event. Rather than handling an event in a callback function, you should directly push the event into a single source and handle downstream effects in the affected features themselves.

Bad example:

```html
<!-- DO NOT DO THIS -->
<button (click)="onFormSubmit()">Submit</button>
```

```typescript
import { Source } from '@state-adapt/core';
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
import { Source } from '@state-adapt/core';
// ... DO THIS
formSubmission$ = new Source<void>('formSubmission$'); // or formSubmitted$
```

There might be numerous states that are impacted by a single event. You should still only create a single source for this event and handle downstream effects in the affected features themselves.

Internally, StateAdapt checks each source you pass into the `init` method to see if you have passed it into the `init` method at any time before. If you have, it doesn't subscribe to the same source again; it just adds its state changes to the list of state changes to apply whenever the first source emits.

The benefit of doing it this way is that you only see one action dispatched in Redux Devtools for each event that occurs in the app, even if dozens of stores are listening to it. They all get piled onto the same action for Redux Devtools.

The drawback is rare, but it does occur: Since we only subscribe to the first observable, cold observables like those created from `of` and `timer` that you would expect to fire for each individual store that uses them will actually only fire for the first store that uses that exact observable reference. The solution? Just create a new reference for each store that uses it. This can be achieved either through a factory function, such as `getTimer = () => timer(5000)`, or by wrapping the reference in a `defer()` when passing it into another store (simply calling `.pipe()` on an observable doesn't seem to create a new reference, so that doesn't work). There might be a more clever workaround, but these work.

This situation is rare and the benefits from having 1 action in Redux Devtools per event is well worth this drawback. But it is good to know about so you can deal with it when you come across it.
