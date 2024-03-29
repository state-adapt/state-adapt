import { Action } from './action.interface';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `getAction`

  `getAction` is a function that takes in an action {@link Type} and optionally {@link Payload} and creates an {@link Action} object.

  #### Example: Creating an action with a payload

  ```typescript
  import { getAction } from '@state-adapt/core';

  const action = getAction('ADD', 1);

  // action = { type: 'ADD', payload: 1 }
  ```
 */
export function getAction<Type extends string>(type: Type): Action<void, Type>;
export function getAction<Type extends string, Payload>(
  type: Type,
  payload: Payload,
): Action<Payload, Type>;
export function getAction<Type extends string, Payload>(type: Type, payload?: Payload) {
  return { type, payload };
}
