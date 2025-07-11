# The Imperative Trap

Imperative code doesn't scale with complexity.

Reactive code is the polar opposite of imperative code; it's extremely difficult to refactor imperative code to reactive code.

This means that the only way to flexibly adapt with complexity and change is to manage state reactively from the very start of every feature.

## Definition

<!--
::: info
If anything here is confusing or seems wrong to you, please see [the longer explanation below](#imperative-programming-long).

::: -->

Imperative **_programming_** is a style of programming that contains imperative code.

Imperative **_code_** is any code that commands or controls things represented by code elsewhere.

This is a traditional example of imperative programming:

```ts:line-numbers
const squared = [] as number[];

for (let i = 1; i <= 3; i++) {
  squared.push(i ** 2);
}
```

Where specifically is the imperative code? Can you see the line of code that's commanding something declared in another line of code?

::: details ANSWER

Line 4 is commanding `squared` to add a number:

```ts:line-numbers {4}
const squared = [] as number[];

for (let i = 1; i <= 3; i++) {
  squared.push(i ** 2);
}
```

<svg style="height: 100px; width: 500px; margin-top: -150px; z-index: 100; position: absolute; stroke-width: 3px">
  <!-- <g transform="translate(125, 0)"> -->
  <g transform=" scale(0.9, 0.9), translate(130, 25)">
    <line x1="15" y1="70" x2="15" y2="15" stroke="var(--vp-c-brand-3)" />
    <line x1="0" y1="30" x2="15" y2="15" stroke="var(--vp-c-brand-3)" />
    <line x1="30" y1="30" x2="15" y2="15" stroke="var(--vp-c-brand-3)" />
  </g>
</svg>
:::

"Imperative" means ["expressive of a command."](https://www.merriam-webster.com/dictionary/imperative)

The command in this code is the `.push()`.

That is the reason it is imperative.

### Long Definition

::: details IMPERATIVE CODE—THE LONG DEFINITION

Imperative programming is a style of programming that always has 2 things:

1. Incomplete initial descriptions
2. Commands modifying those descriptions later

This is a traditional example of imperative programming:

```ts
// 1. Incomplete initial description:
const squared = [] as number[];

for (let i = 1; i <= 3; i++) {
  // 2. Command modifying squared after its initial description:
  squared.push(i ** 2);
}
```

The initial description of `squared` is an empty array, which is incomplete, because after a few more lines have executed, it has become an array of `[1, 4, 9]`. You can't know _what_ `squared` actually is until you see _how_ it's modified in the step-by-step instructions that follow.

Imperative programming is the opposite of declarative programming, where initial descriptions are complete:

```ts
const squared2 = [1, 2, 3].map(i => i ** 2);
```

With declarative programming, we see _what_ `squareNumbers` is from the start.

### Camouflage

Imperative code can be hard to identify. Usually there isn't a neat `for` loop modifying a simple array, but a sprawling mess of tangled code modifying several variables in scope, as well as invoking functions that change variables declared in other scopes.

We don't need a loop in order to modify `squared` with step-by-step instructions:

```ts
const squared = [] as number[];

squared.push(1);
squared.push(4);
squared.push(9);
```

Expressed like this, we can still see _how_ `squared` is constructed, and the initial description of `squared` still doesn't tell us _what_ it is initially. The description is still spread-out, and the example is still imperative.

This is all true even if there is only a single command modifying `squared`:

```ts
// 1. Incomplete initial description:
const squared = [] as number[];

// 2. Command modifying squared after its initial description:
squared.push(1);
```

But just look at this line alone:

```ts
const squared = [] as number[];
```

Based on this alone, we can't know for sure _what_ `squareNumbers` ends up being. `const` prevents reassignments, but there could still be code somewhere that mutates adds to the description of `squared`.

So the declaration of `squareNumbers` itself is not what makes it part of the imperative programming style or not.

Many state management libraries encourage this pattern, but it is difficult to see because the code is more spread-out.

::: info CHECK BACK LATER
This part of the guide is unfinished.
:::

## More Examples of Imperative Code

Here are some examples of imperative programming with the specific imperative code lines highlighted.

If you have any issues with these, please refer to the [long definition](#long-definition) of imperative code.

::: details Sum of Squared Numbers {open}
::: code-group
<<< @/snippets/imperative-examples/sum-of-squared-numbers.ts [Original Snippet]
<<< @/snippets/imperative-examples/sum-of-squared-numbers.ts{4,8} [Imperative Lines Highlighted]
:::

::: details Counter

::: code-group
<<< @/snippets/imperative-examples/react-set-state.tsx [React]
<<< @/snippets/imperative-examples/react-set-state.tsx{7,11} [Imperative Highlighted]
<<< @/snippets/imperative-examples/angular-set-signal.component.ts [Angular]
<<< @/snippets/imperative-examples/angular-set-signal.component.ts{9,13} [Imperative Highlighted]
:::

::: details Increment Chain
::: code-group
<<< @/snippets/imperative-examples/imperative-chain.ts [Original Snippet]
<<< @/snippets/imperative-examples/imperative-chain.ts{5,8,12-13,17-18,21,23} [Imperative Lines Highlighted]

```md [Explanation]
A function containing imperative code is modifying something
that was declared somewhere else every time it is invoked.
This means that every line of code that invokes it is also
responsible for the change.

This has to be the case, or we could almost never highlight
any imperative code, because most of the time the code we
write to make changes is using a wrapper function.

`console.log` is modifying the console log, which is defined
by the browser, not developer code. Although console logs don't
affect application state, it is a shared space being mutated
and it's good to clean them up after use.
```

:::

## Imperative Code Scatters Context

Imperative code splits up and scatters descriptions.

In this example, the timeout is describing the value of `squared` after `1000ms`:

<<< @/snippets/imperative-examples/squared-numbers.ts

Anywhere in the entire codebase that can get a reference to `squared` could add to the description of its behavior by commanding it in some way. In order to understand _what_ it is, you have to find all references and understand code across often dozens of files.

Understanding every reference requires not just understanding the line of code the command is in, but everything in its context that it itself references. In this example, you don't know what `newAmount` is or why this code is running, so you have to spend some time understanding all of that:

```ts
let newAmount = 0;

// ...

newAmount += calculateBonusAmount(settings, user);

export function addToNewAmount(amount: number) {
  newAmount += amount;
  waitAndPushToSquaredSum();
}

function waitAndPushToSquaredSum() {
  setTimeout(() => {
    squared.push(newAmount);
    global.redraw();
  }, 1000);
}
```

## Declarative Code Groups Context

The opposite of imperative programming is declarative programming.

Declarative programming is when every declaration is complete from the start, not added onto later via step-by-step commands for a different final result.

With declarative code, you can understand _what_ something is from its initial description. It isn't broken up into pieces describing _how_ it should be assembled later and elsewhere.

Humans and AI can both understand declarative code more easily, thanks to descriptions being contained and having more limited context.

In this diagram of an imperative Angular codebase, the only change was converting it to declarative code:

![Imperative vs Declarative Programming Diagram](/assets/imperative-declarative-diagram.png)

It's clear that only one of these patterns is scalable.

Read more about the benefits of declarative code:

1. [Focus](https://dev.to/mfp22/rxjs-can-save-your-codebase-49fi#focus)
2. [Debugging with Context](https://dev.to/mfp22/rxjs-can-save-your-codebase-49fi#debugging-with-context)
3. [Avoiding Bugs with Context](https://dev.to/mfp22/rxjs-can-save-your-codebase-49fi#avoiding-bugs-with-context)
4. [Comprehensibility](https://dev.to/mfp22/rxjs-can-save-your-codebase-49fi#comprehensibility)
5. [Separation of Concerns / Colocation](https://dev.to/mfp22/rxjs-can-save-your-codebase-49fi#declarativeness-in-rxjs-vs-signals-only)
6. [Consistent State](https://dev.to/this-is-learning/5-reasons-to-avoid-imperative-code-e09#1-inconsistent-state)
7. [State Locality](https://dev.to/this-is-learning/5-reasons-to-avoid-imperative-code-e09#2-state-elevation)
8. [Smaller Bundles](https://dev.to/this-is-learning/5-reasons-to-avoid-imperative-code-e09#3-large-bundles)
9. [Intuitive Dependency Direction](https://dev.to/this-is-learning/5-reasons-to-avoid-imperative-code-e09#4-unnecessary-complexity)
10. [Easier and Better Variable Names](https://dev.to/this-is-learning/5-reasons-to-avoid-imperative-code-e09#bad-function-names)

## Reactive Programming

Reactive programming is just declarative programming, but for dynamic behavior.

For example, this JSX is declarative:

```tsx
return <h1>I WILL NEVER CHANGE!</h1>;
```

And this JSX is reactive, because it now reacts to new values for `day`:

```tsx
return <h1>I WILL CHANGE ON {day}!</h1>;
```

When static content becomes dynamic, developers can either implement it imperatively, or keep it declarative by implementing it reactively.

## Polar Opposites

Look at where the business logic is located in the imperative `squared` example:

<<< @/snippets/imperative-examples/cubed-numbers.ts{1,5,10}

What is determining what lines of code live next to each other? The **_timing_** they execute in. `squared` is defined across 3 places because they run at different times.

::: tip KEY TAKEAWAY
_**Imperative code is organized by when it runs.**_
:::

In the declarative/reactive version, everything describing `squared`'s behavior should be in one place, including some asynchronous logic. Here it is using reactive extensions for JavaScript ([RxJS](https://rxjs.dev/)):

<<< @/snippets/reactive-examples/cubed-numbers.ts{4-7}

Now `squared` is completely described in one place.

::: tip KEY TAKEAWAY
_**Declarative code is organized by relevance.**_
:::

The difference between declarative and imperative code is **_structural_**.

Here is another example of the same functionality implemented reactively and imperatively. Logic is color-coded by relevance:

![Color-Coded RxJS vs Imperative Signals](/assets/Color-Coded-RxJS-vs-Imperative-Signals.png)

Reactive programming tends to be much cleaner and more concise in complex examples, but the point is the **_structural_** difference between the approaches.

Even converting apps between frameworks is usually easier than converting between imperative and declarative structure. To convert from React to Angular, for most of the code you would only need to write a few straight-forward find/replace operations.

::: details COUNTER IN ANGULAR VS REACT

::: code-group
<<< @/snippets/imperative-examples/react-set-state.tsx [React]
<<< @/snippets/imperative-examples/angular-set-signal.component.ts [Angular]
:::

But imperative and declarative programming are polar opposites, making refactoring out of an imperative mess almost as costly as rewriting everything from scratch. Once the first line of imperative code is written, it is much easier to add more imperative code than to start over with declarative code.

So, make sure you just start with declarative code!
