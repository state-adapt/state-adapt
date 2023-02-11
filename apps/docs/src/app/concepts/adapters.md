# Adapters

- [Overview](/concepts/adapters#overview)
- [State Changes](/concepts/adapters#state-changes)
- [Selectors](/concepts/adapters#selectors)
- [`createAdapter`](/concepts/adapters#createadapter)
- [`buildAdapter`](/concepts/adapters#buildadapter)
- [`joinAdapters`](/concepts/adapters#joinadapters)
- [Adapter Creator Libraries](/concepts/adapters#adapter-creator-libraries)

## `buildAdapter`

Let's look at each of these.

### 1. Selectors

<!-- Advice -->
Selectors should be defined before anything else, since they can be used in reactions, and it helps to have a consistent pattern to make things easily findable.




<!-- Justification -->
Why `s`? Well, should the object (`s`) passed into each selector function be named `selectors`, `state` or `selectorState`? In reality it's just a proxy, so none of these really make sense. So, the convention is `s`, since it's short and the only letter all the possible meanings share.

<!-- Justification -->
Note 1: [`buildAdapter`](/concepts/adapters#buildadapter) is another reason for naming selectors as nouns instead of verbs: Either it would need to do extra, unnecessary processing to add `'get'`s in the `Proxy` property accessor method to find the correct selectors, or developers would need to treat verbs as nouns in their selector functions, which would be awkward: `s => s.getNegative.toString()`.

<!-- Persuasion -->
Note 2: Here's how the above selectors would have been defined using a Redux-like `createSelector` function:

<!-- Persuasion -->
```tsx
import { createSelector } from 'reselect'; // or whatever

// Need a function that returns the selector in order to be
// reusable and independently memoized:
const getSelectReverse = (selectState: (state: string) => string) =>
  createSelector(selectState, state => state.split('').reverse().join(''));

const getSelectIsPalendrome = (selectState: (state: string) => string) =>
  createSelector(
    selectState,
    getSelectReverse(selectState),
    (state, reverse) => state === reverse,
  );

// ...
// Before using for some specific state
const selectReverse = getSelectReverse(selectSpecificState);
const selectIsPalendrome = getSelectIsPalendrome(selectSpecificState);
```

<!-- Persuasion -->
or in RxJS:

```tsx
import { map, combineLatest, distinctUntilChanged } from 'rxjs';

const getReverse = (state: string) => state.split('').reverse().join('');
const getIsPalendrome = ([state, reverse]: [string, string]) =>
  state === reverse;

// ...
// Using in a specific piece of state
const reverse$ = specificState$.pipe(map(getReverse), distinctUntilChanged());
const isPalendrome$ = combineLatest([specificState$, reverse$]).pipe(
  map(getIsPalendrome),
  distinctUntilChanged(),
);
```

### 3. Grouped Reactions

<!-- Justification -->
The reason grouped reactions are useful is because if you tried to reuse `setCoolNumber` and `setWeirdNumber`, you would end up calculating 2 new states:

```typescript
const numbersAdapter = buildAdapter<NumbersState>()({
  setCoolNumber: (state, newCoolNumber: number) => ({
    ...state,
    coolNumber: newCoolNumber,
  }),
  setWeirdNumber: (state, newWeirdNumber: number) => ({
    ...state,
    weirdNumber: newWeirdNumber,
  }),
})(([selectors, reactions]) => ({
  setBothNumbers: (state, newNumber: number) =>
    reactions.setWeirdNumber(reactions.setCoolNumber(state)),
}))();
```

<!-- Justification -->
If you tried to calculate a single new state, you would override properties from the first change with the unchanged properties from the second change, so passing the result of one reaction to the other is the only way to ensure consistent state without duplicating state change logic in the new state reaction. But this is inefficient.

<!-- Justification -->
State change groups are able to efficiently calculate a single new state.

## `joinAdapters`



## Adapter Creator Libraries

State adapters allow state management patterns to be easily reusable.

Similar to how components enabled awesome component libraries for modern UI frameworks, state adapters open up the opportunity for adapter libraries.

StateAdapt has created a few core adapters, and plans to create many more. See the [core adapters documentation](/adapters/core).
