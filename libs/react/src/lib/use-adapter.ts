import { Adapter, ReactionsWithSelectors, Selectors, Sources } from '@state-adapt/core';
import { useContext, useMemo } from 'react';
import { AdaptContext } from './adapt.context';

export function useAdapter<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(
  [path, adapter, initialState]: [string, Adapter<State, S, R>, State],
  sources: Sources<State, S, R>,
) {
  const adapt = useContext(AdaptContext);
  return useMemo(() => adapt.init([path, initialState, adapter], sources), [path]);
}
