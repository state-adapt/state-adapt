export type SecondParameterOrVoid<original extends any[]> = original extends {
  1: infer Second;
}
  ? Second
  : void;
