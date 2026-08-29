#!/usr/bin/env node
import { runCli } from './lib/cli';

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
