import { source, SourceFn } from '@state-adapt/rxjs';
import { useState } from 'react';

/**
 * Creates a source whose identity remains stable while the component is mounted.
 *
 * Use [`source`](/api/rxjs/index/source-1) to create a source outside a component.
 *
 * The returned `SourceFn` is both a callable event emitter and an RxJS
 * Subject. An optional `type` labels its emissions in Redux DevTools.
 *
 * ```tsx
 * import { useAdapt, useSource } from '@state-adapt/react';
 *
 * function Counter() {
 *   const onSet = useSource<number>('set');
 *   const [count] = useAdapt(0, { sources: onSet });
 *
 *   return <button onClick={() => onSet(1)}>{count.state}</button>;
 * }
 * ```
 */
export function useSource<T>(type = ''): SourceFn<T> {
  const [onSource] = useState(() => source<T>(type));
  return onSource;
}
