import * as path from 'node:path';
import { FunctionAnalysis } from '@state-adapt/spaghetti-core';
import { RankedCommand, SpaghettiReport } from './report-models';
import { formatNumber as format } from './format-number';

export function formatHumanReport(report: SpaghettiReport): string {
  const lines = [
    'Spaghetti analyzer report',
    `Project: ${report.project.rootDir}`,
    `Score: ${format(report.project.score)}`,
    `Files: ${report.project.files.length}`,
    `Commands: ${report.project.files.reduce(
      (sum, file) => sum + file.commands.length,
      0,
    )}`,
    ...(report.project.truncated
      ? ['Warning: analysis is incomplete because a configured graph limit was reached.']
      : []),
    '',
    'Functions',
  ];
  if (!report.functionScores.length) lines.push('  (none)');
  report.functionScores.forEach(fn => {
    lines.push(`  ${format(fn.score)}  ${fn.name} (${fn.size} lines)`);
    const functionAnalysis = report.project.files
      .flatMap(file => file.functions)
      .find(candidate => candidate.functionId === fn.functionId);
    functionAnalysis?.commands.forEach(command =>
      lines.push(
        `    ${command.kind}${command.api ? ` (${command.api})` : ''} ` +
          `${command.location.filePath}:${command.location.start.line}` +
          ` distance(declarationLine=${command.distance.declarationLine}, scope=${command.distance.scope}, ` +
          `calls=${command.distance.functionCall}, files=${command.distance.file}, ` +
          `folders=${command.distance.folder})` +
          ` spaghetti(declarationLine=${command.distance.declarationLine}, ` +
          `sameFunction=${command.distance.sameFunction})` +
          formatCallPath(command.callPath) +
          ` score=${format(command.score)}` +
          formatScoreBreakdown(command.scoreBreakdown),
      ),
    );
  });
  lines.push('', 'Files');
  report.project.files
    .slice()
    .sort((a, b) => b.score - a.score)
    .forEach(file =>
      lines.push(
        `  ${format(file.score)}  ${path.relative(
          report.project.rootDir,
          file.filePath,
        )}`,
      ),
    );
  lines.push('', 'Directories');
  report.directoryScores.forEach(directory =>
    lines.push(
      `  ${format(directory.score)}  ${directory.directory} ` +
        `(${directory.files} files, ${directory.commands} commands)`,
    ),
  );
  lines.push('', 'Spaghetti hotspots');
  appendRankedCommands(lines, report.visualizations.hotspots, 'score');
  lines.push('', 'Longest command chains');
  appendRankedCommands(lines, report.visualizations.longestCommandChains, 'chain');
  lines.push('', 'Largest command distances');
  appendRankedCommands(lines, report.visualizations.largestCommandDistances, 'distance');
  lines.push('', 'Score trend');
  if (!report.visualizations.scoreTrend.length) lines.push('  (none)');
  report.visualizations.scoreTrend.forEach(point =>
    lines.push(
      `  ${point.label.padEnd(16)} ${bar(point.score)} ${format(point.score)}` +
        `${
          point.delta === null
            ? ''
            : ` (${point.delta >= 0 ? '+' : ''}${format(point.delta)})`
        }`,
    ),
  );
  return lines.join('\n');
}

function appendRankedCommands(
  lines: string[],
  commands: RankedCommand[],
  metric: 'score' | 'chain' | 'distance',
): void {
  if (!commands.length) lines.push('  (none)');
  commands.forEach(command => {
    const value = metric === 'chain' ? command.chainLength : command[metric];
    lines.push(
      `  ${bar(value)} ${format(value)}  ${command.functionName} -> ${command.kind}`,
    );
  });
}

function bar(value: number): string {
  if (value <= 0) return ''.padEnd(20);
  return '█'.repeat(Math.min(20, Math.max(1, Math.round(value)))).padEnd(20);
}

function formatScoreBreakdown(
  breakdown: FunctionAnalysis['commands'][number]['scoreBreakdown'],
): string {
  return ` [base=${format(breakdown.base)}, declaration=${format(
    breakdown.declarationLineDistance,
  )}, calls=${format(breakdown.functionCallDistance)}, scope=${format(
    breakdown.scopeCrossings,
  )}, files=${format(breakdown.fileCrossings)}, folders=${format(
    breakdown.folderCrossings,
  )}, local=${format(breakdown.sameFunctionDistance)}, size=${format(
    breakdown.functionSize,
  )}]`;
}

function formatCallPath(
  callPath: FunctionAnalysis['commands'][number]['callPath'],
): string {
  if (!callPath.length) return '';
  return ` chain=${[callPath[0].caller, ...callPath.map(hop => hop.callee)].join(
    ' -> ',
  )}`;
}
