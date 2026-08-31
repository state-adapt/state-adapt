import { Command } from '@state-adapt/spaghetti-core';
import { numberOption } from './reporting';
import { RuleOptions } from './types';

export interface CommandPolicy {
  max: number;
  externalPenalty: number | 'ignore';
  allowedCalls: ReadonlySet<string>;
  allowedApis: ReadonlySet<string>;
  weights: {
    declarationLine: number;
    sameFunction: number;
    scope: number;
    functionCall: number;
    file: number;
    folder: number;
  };
}

export function commandPolicy(options: RuleOptions): CommandPolicy {
  const configuredPenalty = options['externalPenalty'];
  return {
    max: numberOption(options, 'max', 0),
    externalPenalty:
      configuredPenalty === 'ignore'
        ? 'ignore'
        : typeof configuredPenalty === 'number'
        ? configuredPenalty
        : Number.POSITIVE_INFINITY,
    allowedCalls: new Set(stringArray(options['allowedCalls'])),
    allowedApis: new Set(stringArray(options['allowedApis'])),
    weights: {
      declarationLine: numberOption(options, 'declarationLineWeight', 0),
      sameFunction: numberOption(options, 'sameFunctionWeight', 0),
      scope: numberOption(options, 'scopeWeight', 1),
      functionCall: numberOption(options, 'functionCallWeight', 1),
      file: numberOption(options, 'fileWeight', 1),
      folder: numberOption(options, 'folderWeight', 1),
    },
  };
}

export function isAllowlisted(command: Command, policy: CommandPolicy): boolean {
  return Boolean(
    (command.call && policy.allowedCalls.has(command.call)) ||
      (command.api && policy.allowedApis.has(command.api)),
  );
}

export function policyDistance(command: Command, policy: CommandPolicy): number {
  const distance = command.distance;
  const weighted =
    distance.declarationLine * policy.weights.declarationLine +
    distance.sameFunction * policy.weights.sameFunction +
    distance.scope * policy.weights.scope +
    distance.functionCall * policy.weights.functionCall +
    distance.file * policy.weights.file +
    distance.folder * policy.weights.folder;
  if (!command.external || policy.externalPenalty === 'ignore') return weighted;
  return weighted + policy.externalPenalty;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}
