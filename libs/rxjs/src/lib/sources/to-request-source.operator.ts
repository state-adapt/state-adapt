import { Observable } from 'rxjs';
import { Action } from '@state-adapt/core';
import { toSource } from './to-source.operator';
import { catchErrorSource } from './catch-error-source.operator';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `toRequestSource`

  `toRequestSource` combines the functionality of {@link toSource} and {@link catchErrorSource} into a single [operator](https://rxjs.dev/guide/operators).

  `toRequestSource` converts an RxJS [Observable](https://rxjs.dev/guide/observable)
  of values of type {@link Payload} (inferred) into an observable of values of type {@link Action}<{@link Payload}, \`${{@link TypePrefix}.success$}\`> | {@link Action}<any, \`${{@link TypePrefix}}.error$\`>.
  It takes one argument, `typePrefix`, which is the prefix of the `type` property of the {@link Action} objects that will be emitted.

  For the actions emitted without an error, the `type` property will be \`${{@link TypePrefix}}.success$}\` and the `payload` property will be the value emitted by the source observable.

  For the actions emitted with an error, the `type` property will be \`${{@link TypePrefix}}.error$}\` and the `payload` property will be the error object.

  #### Example: Converting an observable into a request source

  ```typescript
  import { interval } from 'rxjs';
  import { toRequestSource } from '@state-adapt/rxjs';

  const interval$ = interval(1000).pipe(
    map(n => n < 2 ? n : n.fakeNumberMethod()),
    toRequestSource('interval'),
  );

  interval$.subscribe(console.log);
  // { type: 'interval.success$', payload: 0 }
  // { type: 'interval.success$', payload: 1 }
  // { type: 'interval.error$', payload: 'Error: n.fakeNumberMethod is not a function' }
  ```
 */
export function toRequestSource<Payload, TypePrefix extends string>(
  typePrefix: TypePrefix,
) {
  return (
    source$: Observable<Payload>,
  ): Observable<
    Action<Payload, `${TypePrefix}.success$`> | Action<any, `${TypePrefix}.error$`>
  > => source$.pipe(toSource(`${typePrefix}.success$`), catchErrorSource(typePrefix));
}
