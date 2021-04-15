import type { Update } from './adapt.actions';

export function updatePaths<T>(oldState: T, updates: Update[]): T {
  let newValEntry: Update;
  const nextLevelUpdatedState = updates.reduce(
    (stateWithUpdates, [remainingPath, newVal]) => {
      const nextSegment = remainingPath[0] || '';
      const otherUpdatesForSegment = stateWithUpdates[nextSegment];
      // There can only be one empty remaining path at each level. That gets assigned to the '' property.

      if (!nextSegment) {
        newValEntry = [[], newVal];
        return stateWithUpdates;
      }

      return {
        ...stateWithUpdates,
        [nextSegment]: otherUpdatesForSegment
          ? [...otherUpdatesForSegment, [remainingPath.slice(1), newVal]]
          : [[remainingPath.slice(1), newVal]],
      };
    },
    {} as { [K in keyof T]: [string[], T[K]][] },
  );

  // const isObject = newValEntry && getIsObject(newValEntry[1]);
  const wasObject = getIsObject(oldState);

  return newValEntry
    ? newValEntry[1]
    : Object.entries(nextLevelUpdatedState).reduce(
        (state, [prop, childUpdates]: [string, Update[]]) => ({
          ...(state || {}),
          [prop]: updatePaths((state || {})[prop] || {}, childUpdates),
        }),
        (wasObject ? oldState : {}) as T,
      );
}

function getIsObject(thing: any) {
  return typeof thing === 'object' && !Array.isArray(thing);
}
