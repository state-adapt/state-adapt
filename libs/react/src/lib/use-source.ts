import { Source } from '@state-adapt/rxjs';
import { useState } from 'react';

export function useSource<T>(type: string): Source<T> {
  const [source$] = useState(() => new Source<T>(type));
  return source$;
}
