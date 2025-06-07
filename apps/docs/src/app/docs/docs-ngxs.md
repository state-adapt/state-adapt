# @state-adapt/ngxs

## Peer Dependencies

[@state-adapt/core](/docs/core)

[@state-adapt/rxjs](/docs/rxjs)

[@state-adapt/angular](/angular/docs/angular)

## Index

[`AdaptState`](/angular/docs/ngxs#adaptstate)

[`adaptNgxs`](/angular/docs/ngxs#adaptngxs)

[`watchNgxs`](/angular/docs/ngxs#watchngxs)

## Migration Guide

[2.0.0](/angular/docs/ngxs#200)

<!-- include: '../../../../../libs/ngxs/src/lib/adapt.state.ts#AdaptState' -->

<!-- include: '../../../../../libs/ngxs/src/lib/adapt-ngxs.function.ts#adaptNgxs' -->

<!-- include: '../../../../../libs/ngxs/src/lib/watch-ngxs.function.ts#watchNgxs' -->

<!-- cache 31 -->

### 2.0.0

[Here is a migrator in StackBlitz](https://stackblitz.com/edit/vitejs-vite-bca52l?file=src%2FApp.tsx,src%2FtransformCode.ts)
for automatic migrating. Use Prettier to format the result.

The 4 overloads of [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt) have been removed.
Since [`adaptNgxs`](/angular/docs/ngxs#adaptngxs) wraps [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt),
the same changes apply to [`adaptNgxs`](/angular/docs/ngxs#adaptngxs).
See the [migration guide for @state-adapt/rxjs](/docs/rxjs#200) for details.
