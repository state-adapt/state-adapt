/**
  `Action<T, Type extends string = string>` is a type of object that represents an event. It has a `type` property and a `payload` property.
 */
export interface Action<T, Type extends string = string> {
  type: Type;
  payload: T;
}
