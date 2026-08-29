import {
  analyzeProject,
  AnalysisOptions,
  FunctionAnalysis,
  ProjectAnalysis,
} from '@state-adapt/spaghetti-core';
import * as path from 'node:path';

export interface DirectoryScore {
  directory: string;
  score: number;
  files: number;
  commands: number;
}

export interface SpaghettiReport {
  project: ProjectAnalysis;
  directoryScores: DirectoryScore[];
  functionScores: Array<Pick<FunctionAnalysis, 'functionId' | 'name' | 'score' | 'size'>>;
  visualizations: VisualizationDatasets;
}

export interface HistoricalSnapshot {
  label: string;
  score: number;
  timestamp?: string;
}

export interface ReportOptions {
  /** Maximum rows in each ranked visualization dataset. */
  top?: number;
  /** Caller-owned history. Reporting never writes snapshots implicitly. */
  history?: HistoricalSnapshot[];
  currentLabel?: string;
  currentTimestamp?: string;
}

export interface RankedCommand {
  functionId: string;
  functionName: string;
  filePath: string;
  kind: string;
  score: number;
  distance: number;
  chainLength: number;
  originFunction: string;
}

export interface VisualizationDatasets {
  hotspots: RankedCommand[];
  highestScoringFunctions: Array<{
    functionId: string;
    name: string;
    filePath: string;
    score: number;
    commands: number;
  }>;
  highestScoringFiles: Array<{ filePath: string; score: number; commands: number }>;
  longestCommandChains: RankedCommand[];
  largestCommandDistances: RankedCommand[];
  scoreTrend: Array<HistoricalSnapshot & { delta: number | null }>;
}

export function createReport(
  rootDir: string,
  options: AnalysisOptions = {},
  reportOptions: ReportOptions = {},
): SpaghettiReport {
  return reportFromAnalysis(analyzeProject(rootDir, options), reportOptions);
}

export function reportFromAnalysis(
  project: ProjectAnalysis,
  options: ReportOptions = {},
): SpaghettiReport {
  const directories = new Map<string, DirectoryScore>();
  project.files.forEach(file => {
    const directory = path.relative(project.rootDir, path.dirname(file.filePath)) || '.';
    const score = directories.get(directory) ?? {
      directory,
      score: 0,
      files: 0,
      commands: 0,
    };
    score.score += file.score;
    score.files += 1;
    score.commands += file.commands.length;
    directories.set(directory, score);
  });
  const functionScores = project.files
    .flatMap(file => file.functions)
    .map(({ functionId, name, score, size }) => ({ functionId, name, score, size }))
    .sort(scoreThenId);
  return {
    project,
    directoryScores: [...directories.values()].sort(scoreThenId),
    functionScores,
    visualizations: createVisualizationDatasets(project, options),
  };
}

export function createVisualizationDatasets(
  project: ProjectAnalysis,
  options: ReportOptions = {},
): VisualizationDatasets {
  const top = Math.max(0, Math.floor(options.top ?? 10));
  const commands: RankedCommand[] = project.files.flatMap(file =>
    file.functions.flatMap(fn =>
      fn.commands.map(command => ({
        functionId: fn.functionId,
        functionName: fn.name,
        filePath: file.filePath,
        kind: command.kind,
        score: command.score,
        distance:
          command.distance.declarationLine +
          command.distance.sameFunction +
          command.distance.scope +
          command.distance.functionCall +
          command.distance.file +
          (command.distance.folder ?? 0),
        chainLength: command.callPath.length,
        originFunction: command.originFunction,
      })),
    ),
  );
  const history = [
    ...(options.history ?? []),
    {
      label: options.currentLabel ?? 'current',
      score: project.score,
      ...(options.currentTimestamp ? { timestamp: options.currentTimestamp } : {}),
    },
  ];
  return {
    hotspots: commands.slice().sort(scoreThenId).slice(0, top),
    highestScoringFunctions: project.files
      .flatMap(file =>
        file.functions.map(fn => ({
          functionId: fn.functionId,
          name: fn.name,
          filePath: file.filePath,
          score: fn.score,
          commands: fn.commands.length,
        })),
      )
      .sort(scoreThenId)
      .slice(0, top),
    highestScoringFiles: project.files
      .map(file => ({
        filePath: file.filePath,
        score: file.score,
        commands: file.commands.length,
      }))
      .sort(scoreThenId)
      .slice(0, top),
    longestCommandChains: commands
      .slice()
      .sort((a, b) => b.chainLength - a.chainLength || scoreThenId(a, b))
      .slice(0, top),
    largestCommandDistances: commands
      .slice()
      .sort((a, b) => b.distance - a.distance || scoreThenId(a, b))
      .slice(0, top),
    scoreTrend: history.map((snapshot, index) => ({
      ...snapshot,
      delta: index ? snapshot.score - history[index - 1].score : null,
    })),
  };
}

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
          ` distance(line=${command.distance.line}, scope=${command.distance.scope}, ` +
          `calls=${command.distance.functionCall}, files=${command.distance.file}, ` +
          `folders=${command.distance.folder ?? 0})` +
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

function scoreThenId<T extends { score: number }>(a: T, b: T): number {
  return b.score - a.score || JSON.stringify(a).localeCompare(JSON.stringify(b));
}

function formatScoreBreakdown(
  breakdown: FunctionAnalysis['commands'][number]['scoreBreakdown'],
): string {
  return ` [base=${format(breakdown.base)}, declaration=${format(
    breakdown.declarationLineDistance,
  )}, calls=${format(breakdown.functionCallDistance)}, scope=${format(
    breakdown.scopeCrossings,
  )}, files=${format(breakdown.fileCrossings)}, folders=${format(
    breakdown.folderCrossings ?? 0,
  )}, local=${format(breakdown.sameFunctionDistance)}, size=${format(
    breakdown.functionSize,
  )}, legacy=${format(breakdown.legacyLineDistance)}]`;
}

function formatCallPath(
  callPath: FunctionAnalysis['commands'][number]['callPath'],
): string {
  if (!callPath.length) return '';
  return ` chain=${[callPath[0].caller, ...callPath.map(hop => hop.callee)].join(
    ' -> ',
  )}`;
}

export function formatJsonReport(report: SpaghettiReport, pretty = true): string {
  return JSON.stringify(report, null, pretty ? 2 : undefined);
}

function format(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
