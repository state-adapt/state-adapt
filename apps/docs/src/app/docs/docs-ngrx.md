# @state-adapt/ngrx

## Peer Dependencies

[@state-adapt/core](/docs/core)

[@state-adapt/rxjs](/docs/rxjs)

[@state-adapt/angular](/angular/docs/angular)

## Index

[`adaptNgrx`](/angular/docs/ngrx#adaptngrx)

[`watchNgrx`](/angular/docs/ngrx#watchngrx)

## Migration Guide

[2.0.0](/angular/docs/ngrx#200)

<!-- include: '../../../../../libs/ngrx/src/lib/adapt-ngrx.function.ts#adaptNgrx' -->

<!-- include: '../../../../../libs/ngrx/src/lib/watch-ngrx.function.ts#watchNgrx' -->

<!-- cache 31 -->

### 2.0.0

[Here is a migrator in StackBlitz](https://stackblitz.com/edit/vitejs-vite-bca52l?file=src%2FApp.tsx,src%2FtransformCode.ts)
for automatic migrating. Use Prettier to format the result.

The 4 overloads of [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt) have been removed.
Since [`adaptNgrx`](/angular/docs/ngrx#adaptngrx) wraps [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt),
the same changes apply to [`adaptNgrx`](/angular/docs/ngrx#adaptngrx).
See the [migration guide for @state-adapt/rxjs](/docs/rxjs#200) for details.
