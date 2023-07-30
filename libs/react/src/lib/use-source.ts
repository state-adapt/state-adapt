import { Source } from '../../../../libs/rxjs/src';
import { useState } from 'react';

export function useSource<T>(type: string): Source<T> {
  const [source$] = useState(() => new Source<T>(type));
  return source$;
}
