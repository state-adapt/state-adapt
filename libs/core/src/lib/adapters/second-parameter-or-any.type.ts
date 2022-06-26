export type SecondParameterOrAny<original extends any[]> = original extends {
  1: infer Second;
}
  ? Second
  : any;
