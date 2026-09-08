import { Distance, ResourceOrigin } from './models';

type ResourceDistance = Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'>;

export function distinctResourceOrigins(origins: ResourceOrigin[]): ResourceOrigin[] {
  const unique = new Map<string, ResourceOrigin>();
  for (const origin of origins) {
    const location = origin.location;
    const key = `${origin.kind}:${location?.filePath ?? ''}:${
      location?.start.line ?? 0
    }:${location?.start.column ?? 0}:${origin.parameterIndex ?? ''}`;
    if (!unique.has(key)) unique.set(key, origin);
  }
  return [...unique.values()];
}

export function resourceDistanceRank(distance: ResourceDistance): number {
  return (
    distance.file * 1_000_000_000 +
    distance.folder * 1_000_000 +
    distance.scope * 1_000 +
    distance.declarationLine
  );
}
