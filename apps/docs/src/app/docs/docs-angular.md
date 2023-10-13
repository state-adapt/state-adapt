# @state-adapt/angular

## Peer Dependencies

[@state-adapt/core](/docs/core)

[@state-adapt/rxjs](/docs/rxjs)

## Index

[`defaultStoreProvider`](/angular/docs/angular#defaultstoreprovider)

[`provideStore`](/angular/docs/angular#providestore)

[`adapt`](/angular/docs/angular#adapt)

[`watch`](/angular/docs/angular#watch)

[`adaptInjectable`](/angular/docs/angular#adaptinjectable)

## Migration Guide

[2.0.0](/angular/docs/angular#200)

<!-- include: '../../../../../libs/angular/src/lib/default-store-provider.const.ts#defaultStoreProvider' -->

<!-- include: '../../../../../libs/angular/src/lib/provide-store.function.ts#provideStore' -->

<!-- include: '../../../../../libs/angular/src/lib/adapt.function.ts#adapt' -->

<!-- include: '../../../../../libs/angular/src/lib/watch.function.ts#watch' -->

<!-- include: '../../../../../libs/angular/src/lib/adapt-injectable.function.ts#adaptInjectable' -->

<!-- cache 6 -->

### 2.0.0

The 4 overloads of [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt) have been removed.
Since [`adapt`](/angular/docs/angular#adapt) wraps [`StateAdapt.adapt`](/docs/rxjs#stateadaptadapt),
the same changes apply to [`adapt`](/angular/docs/angular#adapt).
See the [migration guide for @state-adapt/rxjs](/docs/rxjs#200) for details.
