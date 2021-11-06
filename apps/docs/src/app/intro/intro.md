# Why StateAdapt?

## Minimal

StateAdapt achieves the original intent of Redux, but in a much more
minimal way. StateAdapt turns Actions into RxJS Subjects and reducers into
objects, reducing conceptual complexity and eliminating ~40% of the code
required to create event sources and state changes.

## Reactive

StateAdapt relies on RxJS for all unidirectional data flow. Rather than
removing pieces of Redux critical to reactivity, as most alternatives do,
StateAdapt simply reimplements them in RxJS.

## Reusable

StateAdapt uses state adapters to maximize reusability in state management.

# Learn More

Read: [Introducing StateAdapt](https://medium.com/weekly-webtips/introducing-stateadapt-reusable-reactive-state-management-9f0388f1850e)

# Contribute

Want to help out? See our [GitHub repo](https://github.com/state-adapt/state-adapt)
