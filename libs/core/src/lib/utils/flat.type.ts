export type Flat<T> = {} & { [P in Extract<keyof T, string>]: T[P] };
export type FlatAnyKey<T> = {} & { [P in keyof T]: T[P] };
