export function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((flattened, ar) => {
    ar.forEach(el => flattened.push(el));
    return flattened;
  }, [] as T[]);
}
