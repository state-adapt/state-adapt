import { Command } from '@state-adapt/spaghetti-core';
import { Rule } from 'eslint';
import { RuleOptions } from './types';

export function numberOption(
  options: RuleOptions,
  name: string,
  fallback: number,
): number {
  const value = options[name];
  return typeof value === 'number' ? value : fallback;
}

export function reportCommand(
  context: Rule.RuleContext,
  command: Command,
  data: Record<string, string>,
): void {
  context.report({
    loc: eslintLocation(command.callPath[0]?.callLocation ?? command.location),
    messageId: 'spaghetti',
    data,
  });
}

export function format(value: number): string {
  if (!Number.isFinite(value)) return 'maximum';
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function eslintLocation(location: Command['location']) {
  return {
    start: { line: location.start.line, column: location.start.column - 1 },
    end: { line: location.end.line, column: Math.max(0, location.end.column - 1) },
  };
}
