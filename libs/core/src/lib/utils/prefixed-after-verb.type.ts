// prettier-ignore
type UppercaseLetter = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z';

export type PrefixedAfterVerb<
  K extends string,
  Prefix extends string,
> = K extends `${infer Head}${UppercaseLetter}${infer Tail}`
  ? Head extends Lowercase<Head>
    ? K extends `${Head}${infer ActualTail}`
      ? `${Head}${Capitalize<Prefix>}${ActualTail}`
      : `${Head}${Capitalize<Prefix>}`
    : never
  : `${K}${Capitalize<Prefix>}`;
