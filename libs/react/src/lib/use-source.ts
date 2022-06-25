import { Source } from '../../../../libs/core/src';
import { useState } from 'react';

export function useSource<T>(type: string): Source<T> {
  const [source$] = useState(new Source<T>(type));
  return source$;
}
