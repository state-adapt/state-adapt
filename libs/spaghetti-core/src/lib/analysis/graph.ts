import { Command, CommandHop, ScoringConfig } from './models';
import { FunctionDraft } from './internal-types';
import { addDistance, inheritScoreBreakdown } from './scoring';

export function expandCommands(
  fn: FunctionDraft,
  edges: Map<string, Array<{ callee: FunctionDraft; hop: CommandHop }>>,
  functions: Map<string, FunctionDraft>,
  scoring: ScoringConfig,
  ancestors: Set<string>,
  depth: number,
  maxDepth: number,
  maxCommands: number,
  cyclicOrReachable: Set<string>,
  cache: Map<string, { commands: Command[]; truncated: boolean }>,
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
  for (const { callee, hop } of edges.get(fn.functionId) ?? []) {
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
    );
    descendantTruncated ||= expansion.truncated;
    for (const command of expansion.commands) {
      if (expanded.length >= maxCommands) {
        truncated = true;
        break;
      }
      expanded.push(inheritCommand(command, hop, scoring));
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
