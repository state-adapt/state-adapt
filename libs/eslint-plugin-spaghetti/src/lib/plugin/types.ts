import { FunctionAnalysis } from '@state-adapt/spaghetti-core';
import { Rule } from 'eslint';
import { NoSpaghettiOptions } from '../no-spaghetti-options';

export type RuleOptions = NoSpaghettiOptions;

export type RuleCheck = (
  context: Rule.RuleContext,
  options: RuleOptions,
  functions: FunctionAnalysis[],
) => void;
