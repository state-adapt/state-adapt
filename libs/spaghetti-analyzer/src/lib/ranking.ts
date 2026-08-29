export function scoreThenId<T extends { score: number }>(a: T, b: T): number {
  return b.score - a.score || JSON.stringify(a).localeCompare(JSON.stringify(b));
}
