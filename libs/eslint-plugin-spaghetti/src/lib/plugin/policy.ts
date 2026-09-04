import { Command } from '@state-adapt/spaghetti-core';
import { numberOption } from './reporting';
import { RuleOptions } from './types';

export interface CommandPolicy {
  maxScore: number;
}

export function commandPolicy(options: RuleOptions): CommandPolicy {
  return { maxScore: numberOption(options, 'maxScore', 6) };
}

export function policyScore(
  command: Command,
  policy: CommandPolicy,
): { score: number; exceedsLimit: boolean } {
  let score = 0;
  const breakdown = command.scoreBreakdown;
  for (const value of [
    breakdown.base,
    breakdown.declarationLineDistance,
    breakdown.scopeCrossings,
    breakdown.fileCrossings,
    breakdown.folderCrossings,
    breakdown.external,
  ]) {
    score += value;
    if (score > policy.maxScore) return { score, exceedsLimit: true };
  }
  return { score, exceedsLimit: false };
}
