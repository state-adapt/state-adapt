import { FunctionAnalysis } from '@state-adapt/spaghetti-core';
import { Rule } from 'eslint';

export type RuleOptions = Record<string, unknown>;

export type RuleCheck = (
  context: Rule.RuleContext,
  options: RuleOptions,
  functions: FunctionAnalysis[],
) => void;
