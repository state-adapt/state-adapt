---
layout: home

hero:
  name: State Management<br>that adapts with complexity
  # name: StateAdapt
  image: /sa3-3.svg?t=3
  # text: State Management<br>that adapts with complexity
  # text: Adapt with complexity
  alt: Logo image
  tagline: 'Start every feature with scalable state management.<br>No boilerplate. No big refactors.'
  actions:
    - theme: alt
      text: Examples
      link: /guide/examples
    - theme: brand
      text: Get Started
      link: /guide/getting-started

features:
  - title: Adaptive
    details: Local or global? Component or Service? StateAdapt's flexible syntax eliminates the need to ask these annoying questions up front.
    icon:
      src: /adaptive-syntax.svg?t=3
    link: /guide/examples
  - title: Declarative
    details: StateAdapt lets you describe your state and side-effects almost completely declaratively, with as little boilerplate as possible.
    icon:
      src: /declarative-syntax.svg?t=3
    link: https://dev.to/this-is-angular/progressive-reactivity-in-angular-1d40
  - title: Decoupled and Composable
    details: State adapters are decoupled and composable, so state logic is reusable, focused and resilient across change.
    icon:
      src: /reusable-logic.svg?t=3
    link: https://dev.to/this-is-learning/exciting-possibilities-with-state-adapters-3cia
  - title: Automatic
    details: If a store runs out of subscribers, it clears its state. When it gets new subscribers, it re-initializes. No need for external management.
    icon:
      src: /fine-grained-lifecycle.svg?t=3
    link: 'https://dev.to/mfp22/introducing-the-auto-signal-pattern-1a5h#1-automatic-cleanup'
  - title: Concise and Efficient
    details: StateAdapt uses proxies to memoize selectors and hook into Redux DevTools, while enabling extremely concise syntax.
    icon:
      src: /selectors.svg?t=3
    link: https://dev.to/this-is-learning/how-i-got-selectors-in-redux-devtools-443j
  - title: Redux DevTools
    details: StateAdapt's unique approach allows you to use Redux DevTools to inspect and debug both global and local state.
    icon:
      src: /redux-devtools-logo.svg?t=3
    link: /api/rxjs/index/StateAdapt.html#example-function-that-returns-an-observable
---
