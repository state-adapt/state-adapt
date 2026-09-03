import { Command, frameworkApiNames } from '@state-adapt/spaghetti-core';
import { numberOption } from './reporting';
import { RuleOptions } from './types';

export interface CommandPolicy {
  maxScore: number;
  externalPenalty: number;
  apiPenalties: ReadonlyMap<string, number>;
  weights: {
    declarationLine: number;
    scope: number;
    file: number;
    folder: number;
  };
}

export function commandPolicy(options: RuleOptions): CommandPolicy {
  const apiPenalties = new Map<string, number>(frameworkApiNames.map(name => [name, 0]));
  for (const api of options.apis ?? []) {
    if (api.penalty !== undefined) apiPenalties.set(api.name, api.penalty);
  }
  return {
    maxScore: numberOption(options, 'maxScore', 6),
    externalPenalty: numberOption(options, 'externalPenalty', 100),
    apiPenalties,
    weights: {
      declarationLine: numberOption(options, 'declarationLineDistanceWeight', 1),
      scope: numberOption(options, 'scopeWeight', 1),
      file: numberOption(options, 'fileWeight', 30),
      folder: numberOption(options, 'folderWeight', 15),
    },
  };
}

export function isIgnored(command: Command, policy: CommandPolicy): boolean {
  return command.api !== undefined && policy.apiPenalties.get(command.api) === 0;
}

export function policyScore(
  command: Command,
  policy: CommandPolicy,
): { score: number; exceedsLimit: boolean } {
  const distance = command.distance;
  const configuredPenalty = command.api
    ? policy.apiPenalties.get(command.api)
    : undefined;
  let score = configuredPenalty ?? 0;
  score += distance.declarationLine * policy.weights.declarationLine;
  if (score > policy.maxScore) return { score, exceedsLimit: true };
  score += distance.scope * policy.weights.scope;
  if (score > policy.maxScore) return { score, exceedsLimit: true };
  score += distance.file * policy.weights.file;
  if (score > policy.maxScore) return { score, exceedsLimit: true };
  score += distance.folder * policy.weights.folder;
  if (score > policy.maxScore) return { score, exceedsLimit: true };
  if (configuredPenalty === undefined && command.external)
    score += policy.externalPenalty;
  return { score, exceedsLimit: score > policy.maxScore };
}
