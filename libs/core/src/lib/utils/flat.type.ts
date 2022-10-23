export type Flat<T> = {} & { [P in Extract<keyof T, string>]: T[P] };
