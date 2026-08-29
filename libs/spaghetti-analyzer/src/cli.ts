#!/usr/bin/env node
import { AnalysisOptions } from '@state-adapt/spaghetti-analysis';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { createReport, formatHumanReport, formatJsonReport } from './lib/report';

export interface CliResult {
  output: string;
  exitCode: number;
}

export function runCli(args: string[], cwd = process.cwd()): CliResult {
  if (args.includes('--help') || args.includes('-h')) {
    return {
      output:
        'Usage: state-adapt-spaghetti-report [directory] [--json] [--compact] [--config path]\n' +
        'The optional JSON config accepts the AnalysisOptions shape.',
      exitCode: 0,
    };
  }
  const configIndex = args.indexOf('--config');
  const configPath = configIndex >= 0 ? args[configIndex + 1] : undefined;
  const positional = args.find(
    (arg, index) => !arg.startsWith('-') && index !== configIndex + 1,
  );
  const rootDir = path.resolve(cwd, positional ?? '.');
  let options: AnalysisOptions = {};
  if (configPath) {
    options = JSON.parse(fs.readFileSync(path.resolve(cwd, configPath), 'utf8')) as AnalysisOptions;
  }
  const report = createReport(rootDir, options);
  return {
    output: args.includes('--json')
      ? formatJsonReport(report, !args.includes('--compact'))
      : formatHumanReport(report),
    exitCode: 0,
  };
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
