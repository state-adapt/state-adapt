import { source, SourceFn } from '@state-adapt/rxjs';
import { useState } from 'react';

export function useSource<T>(type: string): SourceFn<T> {
  const [onSource] = useState(() => source<T>(type));
  return onSource;
}
