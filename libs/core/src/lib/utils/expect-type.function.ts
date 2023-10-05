export function expectType<T>() {
  return <U>(_value: U): U extends T ? never : { result: U } => {
    return _value as any;
  };
}
