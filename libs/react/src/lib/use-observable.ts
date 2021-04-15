import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

export function useObservable<T>(obs$: Observable<T>) {
  const [state, setState] = useState<T>();
  useEffect(() => {
    const sub = obs$.subscribe(setState);
    return () => sub.unsubscribe();
  }, []);
  return state;
}
