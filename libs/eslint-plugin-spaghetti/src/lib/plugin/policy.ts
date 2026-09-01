import { Command } from '@state-adapt/spaghetti-core';
import { numberOption } from './reporting';
import { RuleOptions } from './types';

export interface CommandPolicy {
  maxScore: number;
  externalPenalty: number;
  allowedCalls: ReadonlySet<string>;
  allowedApis: ReadonlySet<string>;
  weights: {
    declarationLine: number;
    scope: number;
    file: number;
    folder: number;
  };
}

export function commandPolicy(options: RuleOptions): CommandPolicy {
  return {
    maxScore: numberOption(options, 'maxScore', 6),
    externalPenalty: numberOption(options, 'externalPenalty', 200),
    allowedCalls: new Set(stringArray(options['allowedCalls'])),
    allowedApis: new Set(stringArray(options['allowedApis'])),
    weights: {
      declarationLine: numberOption(options, 'declarationLineDistanceWeight', 1),
      scope: numberOption(options, 'scopeWeight', 1),
      file: numberOption(options, 'fileWeight', 30),
      folder: numberOption(options, 'folderWeight', 10),
    },
  };
}

export function isAllowlisted(command: Command, policy: CommandPolicy): boolean {
  return Boolean(
    (command.call && policy.allowedCalls.has(command.call)) ||
      (command.api && policy.allowedApis.has(command.api)),
  );
}

export function policyScore(command: Command, policy: CommandPolicy): number {
  const distance = command.distance;
  const weighted =
    distance.declarationLine * policy.weights.declarationLine +
    distance.scope * policy.weights.scope +
    distance.file * policy.weights.file +
    distance.folder * policy.weights.folder;
  if (!command.external) return weighted;
  return weighted + policy.externalPenalty;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}
