export type Flat<T> = {} & { [P in keyof T]: T[P] };
