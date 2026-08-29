#!/usr/bin/env node
import { AnalysisOptions } from '@state-adapt/spaghetti-core';
import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  createReport,
  formatHumanReport,
  formatJsonReport,
  HistoricalSnapshot,
  ReportOptions,
} from './lib/report';

export interface CliResult {
  output: string;
  exitCode: number;
}

export function runCli(args: string[], cwd = process.cwd()): CliResult {
  if (args.includes('--help') || args.includes('-h')) {
    return {
      output:
        'Usage: spaghetti-analyzer [directory] [--json] [--compact] [--config path] [--top number] [--history path] [--label name]\n' +
        'The optional JSON config accepts AnalysisOptions plus report: { top, history, currentLabel, currentTimestamp }.',
      exitCode: 0,
    };
  }
  const configIndex = args.indexOf('--config');
  const configPath = configIndex >= 0 ? args[configIndex + 1] : undefined;
  const valueIndexes = ['--config', '--top', '--history', '--label']
    .map(flag => args.indexOf(flag))
    .filter(index => index >= 0)
    .map(index => index + 1);
  const positional = args.find(
    (arg, index) => !arg.startsWith('-') && !valueIndexes.includes(index),
  );
  const rootDir = path.resolve(cwd, positional ?? '.');
  let options: AnalysisOptions = {};
  let reportOptions: ReportOptions = {};
  if (configPath) {
    const config = JSON.parse(
      fs.readFileSync(path.resolve(cwd, configPath), 'utf8'),
    ) as AnalysisOptions & { report?: ReportOptions };
    options = config;
    reportOptions = config.report ?? {};
  }
  const top = optionValue(args, '--top');
  if (top !== undefined) reportOptions.top = Number(top);
  const label = optionValue(args, '--label');
  if (label !== undefined) reportOptions.currentLabel = label;
  const historyPath = optionValue(args, '--history');
  if (historyPath)
    reportOptions.history = JSON.parse(
      fs.readFileSync(path.resolve(cwd, historyPath), 'utf8'),
    ) as HistoricalSnapshot[];
  const report = createReport(rootDir, options, reportOptions);
  return {
    output: args.includes('--json')
      ? formatJsonReport(report, !args.includes('--compact'))
      : formatHumanReport(report),
    exitCode: 0,
  };
}

function optionValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

if (require.main === module) {
  try {
    const result = runCli(process.argv.slice(2));
    process.stdout.write(`${result.output}\n`);
    process.exitCode = result.exitCode;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
