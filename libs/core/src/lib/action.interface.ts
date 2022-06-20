export interface Action<T, Type extends string = string> {
  type: Type;
  payload: T;
}
