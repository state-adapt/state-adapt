import {
  Adapter,
  ReactionsWithGetSelectors,
  Selectors,
  Sources,
} from '../../../../libs/core/src';
import { useContext, useMemo } from 'react';
import { AdaptContext } from './adapt.context';

export function useAdapter<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithGetSelectors<State, S>
>(
  [path, adapter, initialState]: [string, Adapter<State, S, R>, State],
  sources: Sources<State, S, R>,
) {
  const adapt = useContext(AdaptContext);
  return useMemo(() => adapt.init([path, adapter, initialState], sources), [
    path,
  ]);
}
