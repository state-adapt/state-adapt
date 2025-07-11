# Imperative Conditioning

## "Indirection"

Developers often describe imperative code as "direct" and reactive code as "indirect," but reactive code is just as direct as imperative code.

Have you ever visited a country where cars drive on the opposite side of the road, and you instinctively look the wrong way for traffic?

![Look Right Painted on Crosswalk](/assets/look-right-indirection-habit.jpeg)

This is the same reason reactive code can seem indirect at first.

It's just conditioning.

Conditioning comes from repetition: The more times you see or practice a pattern, the more the associated neural connections will strengthen, and the more the brain will suggest the same pattern in the future, and the harder it will be to learn a new pattern.

Developers have been strongly conditioned to think declaratively for DOM updates, but imperatively for most other changes.

## Thinking Reactively with the DOM

Here is a buggy count component:

::: info COUNTER

<script setup>
import Counter from '../../components/Counter.vue'
</script>

<Counter broken />

:::

When you click "Increment", "Count" goes up, but "Double" stays at 4.

If you had to debug this with "Inspect Element", where would you click to find the problem as quickly as possible?

What if I told you this UI was built in 2007?

```html
<!-- index.html -->
<div class="counter">
  <p id="count">2</p>
  <p id="double">4</p>
  <button id="increment">Increment</button>
</div>
```

```js
// index.js
var $count = $('#count');
var $double = $('#double');
$('#increment').on('click', () => {
  var n = parseInt($count.text(), 10);
  $count.text(n + 1);
});
```

The correct answer in 2007 would have been the increment button. In 2007, the way to manage the DOM was inside event handlers with plain JS or jQuery. The button element would have an `id` to search for in JS code, or the name of the `onClick` event handler.

These days, every framework supports reactive DOM syntax:

::: code-group

```angular-ts{8} [Angular]
import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <div class="counter">
      <p>{{ count }}</p>
      <p>{{ count * 2 }}</p>
      <button (click)="increment()">Increment</button>
    </div>
  `,
})
export class CounterComponent {
  count = 2;

  increment() {
    this.count++;
  }
}
```

```tsx{13} [React]
import React, { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(2);

  function increment() {
    setCount(count + 1);
  }

  return (
    <div className="counter">
      <p>{count}</p>
      <p>{count * 2}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

```svelte{11} [Svelte]
<script>
  let count = 2;

  function increment() {
    count++;
  }
</script>

<div class="counter">
  <p>{count}</p>
  <p>{count * 2}</p>
  <button on:click={increment}>Increment</button>
</div>
```

```tsx{13} [Solid]
import { createSignal } from 'solid-js';

export function Counter() {
  const [count, setCount] = createSignal(2);

  function increment() {
    setCount(count() + 1);
  }

  return (
    <div class="counter">
      <p>{count()}</p>
      <p>{count() * 2}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

```vue{14} [Vue]
<script setup>
import { ref } from 'vue';

const count = ref(2);

function increment() {
  count.value++;
}
</script>

<template>
  <div class="counter">
    <p>{{ count }}</p>
    <p>{{ count * 2 }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

`count * 2` will react when `count` changes.

:::

Remember:

::: tip KEY CONCEPT
_**Imperative code is organized by when it runs.**_
:::

For the DOM with jQuery, the code ends up in event handlers, because they execute **_when_** changes need to be made.

::: tip KEY CONCEPT
_**Declarative code is organized by relevance.**_
:::

For the DOM with modern frameworks, the code ends up in DOM expressions, because that's where changes are **_relevant_**. `count * 2` has its very own place there, decoupled from when or why `count` changes.

So between 2007 and now, where you should look when debugging flipped to the opposite side of the cause/effect relationship, from the event handler to the DOM expression. No extra steps were added and nothing was obfuscated—it just moved.

All developers need is experience seeing DOM updates in DOM expressions. After a while, that's the first place they will look for them. It will start to feel completely natural and not indirect at all.

### Frameworks

None of this is possible without frameworks. In the 2020s it is still impossible to describe the DOM reactively in vanilla JavaScript and HTML. To bring reactive DOM syntax to JavaScript and HTML, every framework has had to invent its own

- language
- compiler
- syntax highlighter
- IDE language service
- Chrome Devtools extension to bring a sort of "Click to Definition" to their new DOM language (a key benefit of declarative code, since "definitions" are actually complete).

Finally, they created **documentation and tutorials** that thoroughly condition developers to think reactively with DOM expressions. The websites for [React](https://react.dev/learn), [Angular](https://angular.dev/tutorials/learn-angular), [Svelte](https://svelte.dev/tutorial/svelte/welcome-to-svelte), [Solid](https://www.solidjs.com/tutorial/introduction_basics) and [Vue](https://vuejs.org/guide/essentials/application.html) strongly establish the pattern of reactive DOM expressions. All of them support imperative DOM manipulation, but it is buried in the docs and considered an "advanced" pattern or "escape hatch." [Vue](https://vuejs.org/guide/essentials/template-refs.html) is the first to show imperative DOM manipulations, but only after 30+ reactive DOM expressions. [React](https://react.dev/learn/manipulating-the-dom-with-refs) shows hundreds of reactive DOM expressions before imperative DOM mutations with `useRef`.

## Confusion with Derived State

Frameworks have been very inconsistent with derived state.

[React's old documentation](https://legacy.reactjs.org/docs/lifting-state-up.html) was very effective at training developers to have a declarative mindset for derived state. It had many examples like this:

```tsx
render() {
  const scale = this.state.scale;
  const temperature = this.state.temperature;
  const celsius = scale === 'f' ? tryConvert(temperature, toCelsius) : temperature;
  const fahrenheit = scale === 'c' ? tryConvert(temperature, toFahrenheit) : temperature;

  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

They built a strong expectation that at the top of a `render` function, devs will probably see things like

```tsx
const double = this.props.count * 2;
const more = // ...
// etc...
```

But [React's new docs](https://react.dev/learn) are full of values that are initially only partially described, then later controlled imperatively, like this:

```tsx
const cups = [];
for (let i = 1; i <= 12; i++) {
  cups.push(<Cup key={i} guest={i} />);
}
```

It's no longer consistently declarative.

And for some reason, all of the examples of derived state that actually are declarative use `let`, so it's impossible to know at a glance that they are declarative:

```tsx
let person = props.person;
// Reassigned later? 🤷
```

It's ironic that React has become such an imperative-friendly framework, because, out of all frameworks, React makes declarative derived state easiest to express:

```ts
const double = count * 2; // React

double = computed(() => this.count() * 2); // Angular

const double = $derived(count * 2); // Svelte

const double = computed(() => count.value * 2); // Vue

const double = createMemo(() => count() * 2); // Solid
```

Signals frameworks, fortunately, have moved in the opposite direction.

Before Angular went all-in on signals in 2023, this was the only way to [efficiently](https://dev.to/this-is-angular/simple-derived-state-progressive-reactivity-in-angular-48oe#syntactic-dead-ends) derive state from component inputs:

```ts
export class MyComponent implements OnChanges {
  @Input() input = 0;
  derivedState = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.input) {
      this.derivedState = changes.input.currentValue * 2;
    }
  }
}
```

Consequently, the few examples of derived state in the [old Angular docs](https://v17.angular.io/guide/lifecycle-hooks#defining-custom-change-detection) were imperative.

But now with signals, the [new Angular docs](https://angular.dev/guide/components/inputs#reading-inputs) have plenty of examples of declarative derived state, like this:

```ts
export class CustomSlider {
  value = input(0);
  label = computed(() => `The slider's value is ${this.value()}`);
}
```

And in the Svelte, Vue and Solid docs, 100% of examples of derived state are declarative.

This is a very encouraging change.

## Reactivity in Hostile Frameworks

It's difficult to build a reactive mindset within frameworks that train and force developers to think imperatively.

Prior to signals, Angular was a hostile environment for reactive programming. If you wanted to declare asynchronous data reactively from a component input, this is what you would have to do:

```ts
export class MyComponent implements OnChanges {
  @Input() id = '';
  id$ = new BehaviorSubject<string>('');
  data$ = this.id$.pipe(switchMap(id => this.dataService.getData(id)));

  ngOnChanges(changes: SimpleChanges) {
    if (changes.id) {
      this.id$.next(changes.id.currentValue); // Imperative
    }
  }
}
```

This (and another variant with an input setter) requires a change handler containing imperative code. So, to write reactive code with Angular's component APIs, you had to write imperative code first to connect it.

Since reactive and imperative are opposites, the boundaries between them create a lot of friction. If you are already editing an event handler, the most natural next step is to write another instruction commanding something to update; and if you are already editing a declaration, the most natural next thing is to rope in another signal or observable to add to its behavior.

Since Angular already required the `ngOnChanges` handler, switching to a reactive pattern created friction. Look how much less ceremony was required when simply continuing imperatively within `ngOnChanges`:

```ts
export class MyComponent implements OnChanges {
  @Input() id = '';
  data = {} as Data;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.id) {
      this.dataService.getData(changes.id.currentValue).subscribe(data => {
        this.data = data; // Imperative
      });
    }
  }
}
```

This is more "direct," isn't it? It's easy to see why Angular developers would be conditioned to dislike touching RxJS, as this example represents some of the most frequent use cases in simple projects. It has a race condition, but that hasn't stopped a lot of Angular devs from preferring it. And that's why [the Angular community is split on RxJS](https://dev.to/this-is-angular/i-changed-my-mind-angular-needs-a-reactive-primitive-n2g#you-turned-them-against-me): Devs who have worked with complex event-driven applications _love_ it, while others _hate_ it.

But with Angular's new signal inputs, the version with RxJS looks like this:

```ts
export class MyComponent {
  id = input('');
  id$ = toObservable(this.id);
  data$ = this.id$.pipe(switchMap(id => this.dataService.getData(id)));
}
```

It would be inaccurate to describe that as "indirect" and the imperative version with `ngOnChanges` as "direct." But if all you knew was the old Angular APIs, you might incorrectly conclude that reactive programming and RxJS are inherently difficult.

But the friction at the boundaries between reactive and imperative code is only part of the issue. When the basic framework APIs all require imperative code, all the examples in documentation, articles and codebases are additional exposure to imperative patterns for developers, further conditioning developers to think imperatively rather than reactively.

## Reactivity in Friendly Frameworks

The more time developers spend editing declarations rather than commands, the more they want to do it. This is not just for one specific layer, like DOM expressions; a general expectation grows that everything should live in complete descriptions rather than scattered instructions.

It's easy to see how something reactive like [React Query](https://tanstack.com/query/latest/docs/framework/react/quick-start) could have emerged in React. React developers were accustomed to writing `const thing = `, `const thing2 = ` over and over again, so it was very natural to also write `const query = ...` for async data. React Query caught on very quickly and is used in [1 in every 6](https://ui.dev/why-react-query) React projects, and inspired [RTK Query](https://redux-toolkit.js.org/rtk-query/overview), a similar implementation with Redux.

SolidJS pioneered modern signals, so it has been swimming in declarative patterns from the start. So it is also natural that Solid provides `createResource` for some asynchronous reactivity. It also has decent support for RxJS integration.

Signals solve reactivity elegantly for the most common use-cases, so we can expect to see more and more reactive patterns naturally grow out of signal frameworks.

## The Last Fundamental Limitation

You can code reactively as much as you want in most frameworks, except in one situation: DOM events need a callback function (unless you're using [CycleJS](https://cycle.js.org/)). You should minimize and inline them:

::: code-group

```tsx [React]
export function Counter {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: { count }</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

```angular-ts [Angular]
@Component({
  selector: 'app-counter',
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <button (click)="count.set(count() + 1)">Increment</button>
    </div>
  `,
})
export class CounterComponent {
  count = signal(0);
}
```

:::

Or if multiple states need to react, the event itself should be represented so the event callback can still affect only 1 thing, minimizing its imperative code:

::: code-group

```tsx [React]
export function Counter {
  const onIncrement = useSource<number>();

  const [count1] = useAdapt(0, {
    adapter: numberAdapter,
    sources: { add: onIncrement },
  });

  const [count2] = useAdapt(0, {
    adapter: numberAdapter,
    sources: { add: onIncrement },
  });

  return (
    <div>
      <p>Count 1: {count1}</p>
      <p>Count 2: {count2}</p>
      <button onClick={() => onIncrement(1)}>Increment</button>
    </div>
  );
}
```

```angular-ts [Angular]
@Component({
  selector: 'app-counter',
  template: `
    <div>
      <p>Count 1: {{ count1() }}</p>
      <p>Count 2: {{ count2() }}</p>
      <button (click)="increment$.next(1)">Increment</button>
    </div>
  `,
})
export class CounterComponent {
  increment$ = source<number>();

  count1 = adapt(0, {
    adapter: numberAdapter,
    sources: { add: this.increment$ },
  });

  count2 = adapt(0, {
    adapter: numberAdapter,
    sources: { add: this.increment$ },
  });
}
```

:::
