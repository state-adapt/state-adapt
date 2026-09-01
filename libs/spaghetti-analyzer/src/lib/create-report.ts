import * as path from 'node:path';
import { analyzeProject } from '@state-adapt/spaghetti-core';
import {
  AnalysisOptions,
  DirectoryScore,
  ProjectAnalysis,
  ReportOptions,
  SpaghettiReport,
} from './report-models';
import { createVisualizationDatasets } from './visualization-datasets';
import { scoreThenId } from './ranking';

/** Analyze a TypeScript project and create a report from its results. */
export function createReport(
  rootDir: string,
  options: AnalysisOptions = {},
  reportOptions: ReportOptions = {},
): SpaghettiReport {
  return reportFromAnalysis(analyzeProject(rootDir, options), reportOptions);
}

/** Create a report from an existing project analysis without analyzing source again. */
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
