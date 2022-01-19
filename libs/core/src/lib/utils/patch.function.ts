export function patch<T>(updater: (s: T) => Partial<T>) {
  return (obj: T) => ({ ...obj, ...updater(obj) });
}
