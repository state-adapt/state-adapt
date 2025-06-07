# @state-adapt/react

## Peer Dependencies

[@state-adapt/core](/docs/core)

[@state-adapt/rxjs](/docs/rxjs)

## Index

[`useAdapt`](/react/docs/react#useadapt)

[`useStore`](/react/docs/react#usestore)

## Migration Guide

[3.0.0](/react/docs/react#300)

[2.0.0](/react/docs/react#200)

<!-- include: '../../../../../libs/react/src/lib/use-adapt.ts#useAdapt' -->

<!-- include: '../../../../../libs/react/src/lib/use-store.ts#useStore' -->

<!-- cache 3 -->

### 3.0.0

#### `useStore`

`useStore` has a small breaking change to match the syntax of [`useAdapt`](/react/docs/react#useadapt) (and `useState`).

Most projects can be migrated with 2 regex find/replaces.

First, do a project-wide regex find/replace for the cases where a selector is accessed at the end of a `useStore` line:

```diff-ts
-const ([^\[\]]*?) = useStore\((.*?)\)\.(.*?);
+const [{ $3: $1 }] = useStore($2);
```

Result:

```diff-ts
-const points = useStore(curveParamStores.points).state;
+const [{ state: points }] = useStore(curveParamStores.points);
```

Second, do a project-wide regex find/replace for the usual case:

```diff-ts
-const ([^\[\]]*?) = useStore\(
+const [$1] = useStore(
```

Result:

```diff-ts
-const name = useStore(nameStore);
+const [name] = useStore(nameStore);
```

Some situations may differ slightly, but this should catch almost everything.

### 2.0.0

[Here is a migrator in StackBlitz](https://stackblitz.com/edit/vitejs-vite-bca52l?file=src%2FApp.tsx,src%2FtransformCode.ts)
for automatic migrating. Use Prettier to format the result.

The 4 overloads of [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt) have been removed.
Since [`useAdapt`](/react/docs/react#useadapt) wraps [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt),
the same changes apply to [`useAdapt`](/react/docs/react#useadapt).
See the [migration guide for @state-adapt/rxjs](/docs/rxjs#200) for details.
