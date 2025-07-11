# The Reactivity Rule

## Everything that can be derived should be derived.

<script setup>
import Counter from '../../components/Counter.vue'
</script>

### Other ways of saying this

- Don't duplicate state.
- Everything possible should react.
- All code should be as far downstream as possible.
- All code should be as local as possible.
- All code should be declarative.
- No code should be imperative.
- Don't create event handlers or callback functions.
- All data flow should be unidirectional.

Learn more about these definitions [here](./imperative-trap).

### Examples

Think about how you would code this counter:

::: info COUNTER

<Counter />

:::

You can see the similarities between `Count` and `Double`, right? `Double` changes along with `Count`, and it is always twice the value of `Count`. That means it can be derived from `Count`. So, it should be derived from `Count`:

```tsx
<p>Double: {count * 2}</p>
```

Developers used to put this kind of logic inside event handlers.

If `Double` were instead `Debounced`, many developers today would still put its logic in a callback function:

```tsx
const [debouncedCount, setDebouncedCount] = useState(count);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedCount(count);
  }, 1000);

  return () => clearTimeout(timer);
}, [count]);
```

But RxJS or custom React hooks (or signals) allow deriving `Derived` instead:

```tsx
const delayedCount = useDebounce(count, 1000);
```

::: details `useDebounce`

```ts
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

Reactivity often hides internal imperative code. Reactivity is not like function purity: Pure functions can't call impure functions, but reactive expressions can call functions that contain imperative code, as long as it's only modifying declarations from its own scope.

:::
