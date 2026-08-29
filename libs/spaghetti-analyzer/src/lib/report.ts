import {
  analyzeProject,
  AnalysisOptions,
  FunctionAnalysis,
  ProjectAnalysis,
} from '@state-adapt/spaghetti-analysis';
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
}

export function createReport(
  rootDir: string,
  options: AnalysisOptions = {},
): SpaghettiReport {
  return reportFromAnalysis(analyzeProject(rootDir, options));
}

export function reportFromAnalysis(project: ProjectAnalysis): SpaghettiReport {
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
  return {
    project,
    directoryScores: [...directories.values()].sort((a, b) => b.score - a.score),
    functionScores: project.files
      .flatMap(file => file.functions)
      .map(({ functionId, name, score, size }) => ({ functionId, name, score, size }))
      .sort((a, b) => b.score - a.score),
  };
}

export function formatHumanReport(report: SpaghettiReport): string {
  const lines = [
    'StateAdapt spaghetti report',
    `Project: ${report.project.rootDir}`,
    `Score: ${format(report.project.score)}`,
    `Files: ${report.project.files.length}`,
    `Commands: ${report.project.files.reduce(
      (sum, file) => sum + file.commands.length,
      0,
    )}`,
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
        `    ${command.kind} ${command.location.filePath}:${command.location.start.line}` +
          ` distance(line=${command.distance.line}, scope=${command.distance.scope}, ` +
          `calls=${command.distance.functionCall}, files=${command.distance.file})` +
          formatCallPath(command.callPath) +
          ` score=${format(command.score)}`,
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
  return lines.join('\n');
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
