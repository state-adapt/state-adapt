// eslint-disable-next-line @typescript-eslint/ban-types -- Intersection intentionally forces a materialized IntelliSense type.
export type Flat<T> = {} & { [P in Extract<keyof T, string>]: T[P] };
// eslint-disable-next-line @typescript-eslint/ban-types -- Intersection intentionally forces a materialized IntelliSense type.
export type FlatAnyKey<T> = {} & { [P in keyof T]: T[P] };
