import { Source } from '../../../../libs/core/src';
import { useContext, useMemo } from 'react';
import { Observable } from 'rxjs';
import { AdaptContext } from './adapt.context';

export function useUpdater<State>(
  path: string,
  initialState: State,
  source$: Source<State>,
): Observable<State> {
  const adapt = useContext(AdaptContext);
  return useMemo(() => adapt.updater(path, initialState, source$), [path]);
}
