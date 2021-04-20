import { Source } from '../../../../libs/core/src';
import { useContext, useMemo } from 'react';
import { Observable } from 'rxjs';
import { AdaptContext } from './adapt.context';

export function useSetter<State>(
  path: string,
  initialState: State,
  source$: Source<State>,
): Observable<State> {
  const adapt = useContext(AdaptContext);
  return useMemo(() => adapt.setter(path, initialState, source$), [path]);
}
