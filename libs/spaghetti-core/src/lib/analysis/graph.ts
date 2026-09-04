import {
  Command,
  CommandHop,
  Distance,
  ResourceOrigin,
  ResourceProvenance,
  ScoringConfig,
  SourceLocation,
} from './models';
import { CallEdge, FunctionDraft, MODULE_FUNCTION_NAME } from './internal-types';
import {
  addDistance,
  inheritScoreBreakdown,
  rebaseResourceScoreBreakdown,
} from './scoring';
import { ResolvedResource } from './resource-resolution';

export function expandCommands(
  fn: FunctionDraft,
  edges: Map<string, CallEdge[]>,
  functions: Map<string, FunctionDraft>,
  scoring: ScoringConfig,
  ancestors: Set<string>,
  depth: number,
  maxDepth: number,
  maxCommands: number,
  cyclicOrReachable: Set<string>,
  cache: Map<string, { commands: Command[]; truncated: boolean }>,
  apiPenalties: ReadonlyMap<string, number>,
): { commands: Command[]; truncated: boolean } {
  if (ancestors.has(fn.functionId)) return { commands: [], truncated: false };
  if (depth > maxDepth) return { commands: [], truncated: true };
  const cacheKey = `${fn.functionId}\0${maxDepth - depth}\0${maxCommands}`;
  if (!cyclicOrReachable.has(fn.functionId)) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }
  const nextAncestors = new Set(ancestors).add(fn.functionId);
  let descendantTruncated = false;
  const expanded = fn.directCommands.slice(0, maxCommands);
  let truncated = fn.directCommands.length > maxCommands;
  for (const edge of edges.get(fn.functionId) ?? []) {
    const { callee } = edge;
    if (expanded.length >= maxCommands) {
      truncated = true;
      break;
    }
    const target = functions.get(callee.functionId);
    if (!target || nextAncestors.has(target.functionId)) continue;
    const expansion = expandCommands(
      target,
      edges,
      functions,
      scoring,
      nextAncestors,
      depth + 1,
      maxDepth,
      maxCommands - expanded.length,
      cyclicOrReachable,
      cache,
      apiPenalties,
    );
    descendantTruncated ||= expansion.truncated;
    for (const command of expansion.commands) {
      if (expanded.length >= maxCommands) {
        truncated = true;
        break;
      }
      const bound = bindParameterOrigins(command, edge.arguments, scoring, apiPenalties);
      if (isPrivateToBoundary(bound, target, functions)) continue;
      expanded.push(inheritCommand(bound, edge.hop, scoring));
    }
  }
  const result = { commands: expanded, truncated: truncated || descendantTruncated };
  if (!cyclicOrReachable.has(fn.functionId)) cache.set(cacheKey, result);
  return result;
}

export function functionsReachingCycles(
  edges: Map<string, Array<{ callee: FunctionDraft }>>,
  functions: FunctionDraft[],
): Set<string> {
  const unsafe = new Set<string>();
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const visit = (id: string): boolean => {
    if (visiting.has(id)) {
      stack.slice(stack.indexOf(id)).forEach(item => unsafe.add(item));
      return true;
    }
    if (visited.has(id)) return unsafe.has(id);
    visiting.add(id);
    stack.push(id);
    let reaches = false;
    for (const edge of edges.get(id) ?? [])
      reaches = visit(edge.callee.functionId) || reaches;
    stack.pop();
    visiting.delete(id);
    visited.add(id);
    if (reaches) unsafe.add(id);
    return reaches;
  };
  functions.forEach(fn => visit(fn.functionId));
  return unsafe;
}

function inheritCommand(
  command: Command,
  hop: CommandHop,
  scoring: ScoringConfig,
): Command {
  const scoreBreakdown = inheritScoreBreakdown(command.scoreBreakdown, hop, scoring);
  return {
    ...command,
    callPath: [hop, ...command.callPath],
    distance: addDistance(command.distance, hop.distance),
    scoreBreakdown,
    score: scoreBreakdown.total,
  };
}

function isPrivateToBoundary(
  command: Command,
  boundary: FunctionDraft,
  functions: Map<string, FunctionDraft>,
): boolean {
  const origins = command.resourceProvenance?.origins;
  return Boolean(
    origins?.length &&
      origins.every(
        origin =>
          origin.kind === 'allocation' &&
          allocationOwner(origin.location, functions)?.functionId === boundary.functionId,
      ),
  );
}

function allocationOwner(
  location: SourceLocation | undefined,
  functions: Map<string, FunctionDraft>,
): FunctionDraft | undefined {
  if (!location) return undefined;
  return [...functions.values()]
    .filter(
      fn =>
        fn.name !== MODULE_FUNCTION_NAME &&
        fn.sourceFile.fileName === location.filePath &&
        contains(fn.location, location),
    )
    .sort((left, right) => locationSize(left.location) - locationSize(right.location))[0];
}

function contains(container: SourceLocation, location: SourceLocation): boolean {
  return (
    comparePosition(container.start, location.start) <= 0 &&
    comparePosition(container.end, location.end) >= 0
  );
}

function comparePosition(
  left: SourceLocation['start'],
  right: SourceLocation['start'],
): number {
  return left.line - right.line || left.column - right.column;
}

function locationSize(location: SourceLocation): number {
  return (
    (location.end.line - location.start.line) * 1_000_000 +
    location.end.column -
    location.start.column
  );
}

function bindParameterOrigins(
  command: Command,
  argumentsByParameter: Array<ResolvedResource | undefined>,
  scoring: ScoringConfig,
  apiPenalties: ReadonlyMap<string, number>,
): Command {
  const provenance = command.resourceProvenance;
  if (!provenance?.origins.some(origin => origin.parameterIndex !== undefined))
    return command;

  const origins = provenance.origins.flatMap(origin => {
    if (origin.parameterIndex === undefined) return [origin];
    return (
      argumentsByParameter[origin.parameterIndex]?.provenance.origins ?? [unknownOrigin()]
    );
  });
  const boundResources = provenance.origins
    .filter(origin => origin.parameterIndex !== undefined)
    .map(origin => argumentsByParameter[origin.parameterIndex ?? -1])
    .filter((item): item is ResolvedResource => item !== undefined);
  const distance = combinedResourceDistance(
    command,
    boundResources,
    provenance.origins.some(origin => origin.parameterIndex === undefined),
  );
  const external = origins.some(origin => origin.kind === 'external');
  const scoreBreakdown = rebaseResourceScoreBreakdown(
    command.scoreBreakdown,
    distance,
    external,
    !command.api || !apiPenalties.has(command.api),
    scoring,
  );
  const primary = worstResource(boundResources);
  return {
    ...command,
    ...(primary?.name ? { resource: primary.name } : {}),
    declaration: primary?.declaration,
    resourceProvenance: provenanceFrom(origins),
    external: external ? true : undefined,
    remote: external || distance.scope > 0 || distance.file > 0,
    distance: replaceResourceDistance(command, distance),
    scoreBreakdown,
    score: scoreBreakdown.total,
  };
}

function unknownOrigin(): ResourceOrigin {
  return { kind: 'unknown' };
}

function provenanceFrom(origins: ResourceOrigin[]): ResourceProvenance {
  const distinct = distinctPublicOrigins(origins);
  const unknown = distinct.filter(origin => origin.kind === 'unknown').length;
  return {
    confidence:
      unknown === distinct.length ? 'unknown' : unknown > 0 ? 'partial' : 'proven',
    origins: distinct,
  };
}

function distinctPublicOrigins(origins: ResourceOrigin[]): ResourceOrigin[] {
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

function combinedResourceDistance(
  command: Command,
  resources: ResolvedResource[],
  includeCurrent: boolean,
): Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'> {
  const distances = resources.map(resource => resource.distance);
  if (includeCurrent || distances.length === 0)
    distances.push(currentOriginDistance(command));
  return distances.reduce((worst, distance) =>
    distanceRank(distance) > distanceRank(worst) ? distance : worst,
  );
}

function worstResource(resources: ResolvedResource[]): ResolvedResource | undefined {
  return resources
    .slice()
    .sort((left, right) => distanceRank(right.distance) - distanceRank(left.distance))[0];
}

function currentOriginDistance(
  command: Command,
): Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'> {
  const distanceFor = (factor: string): number =>
    command.scoreBreakdown.contributions.find(
      item => item.layer === 'origin' && item.factor === factor,
    )?.distance ?? 0;
  return {
    declarationLine: distanceFor('declaration-line-distance'),
    scope: distanceFor('scope-crossings'),
    file: distanceFor('file-crossings'),
    folder: distanceFor('folder-crossings'),
  };
}

function replaceResourceDistance(
  command: Command,
  replacement: Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'>,
): Distance {
  const current = currentOriginDistance(command);
  return {
    ...command.distance,
    declarationLine:
      command.distance.declarationLine -
      current.declarationLine +
      replacement.declarationLine,
    scope: command.distance.scope - current.scope + replacement.scope,
    file: command.distance.file - current.file + replacement.file,
    folder: command.distance.folder - current.folder + replacement.folder,
  };
}

function distanceRank(
  distance: Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'>,
): number {
  return (
    distance.file * 1_000_000_000 +
    distance.folder * 1_000_000 +
    distance.scope * 1_000 +
    distance.declarationLine
  );
}
