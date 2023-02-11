/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `Action`

  `Action<T, Type extends string = string>` is a type of object that represents an event. It has a `type` property and a `payload` property.
 */
export interface Action<T, Type extends string = string> {
  type: Type;
  payload: T;
}
