# @state-adapt/react

## Peer Dependencies

[@state-adapt/core](/docs/core)

[@state-adapt/rxjs](/docs/rxjs)

## Index

[`useStore`](/react/docs/react#usestore)

[`useAdapt`](/react/docs/react#useadapt)

## Migration Guide

[2.0.0](/react/docs/react#200)

<!-- include: '../../../../../libs/react/src/lib/use-store.ts#useStore' -->

<!-- include: '../../../../../libs/react/src/lib/use-adapt.ts#useAdapt' -->

<!-- cache 3 -->

### 2.0.0

[Here is a migrator in StackBlitz](https://stackblitz.com/edit/vitejs-vite-bca52l?file=src%2FApp.tsx,src%2FtransformCode.ts)
for automatic migrating. Use Prettier to format the result.

The 4 overloads of [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt) have been removed.
Since [`useAdapt`](/react/docs/react#useadapt) wraps [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt),
the same changes apply to [`useAdapt`](/react/docs/react#useadapt).
See the [migration guide for @state-adapt/rxjs](/docs/rxjs#200) for details.
