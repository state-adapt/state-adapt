import { ProjectAnalysis } from '@state-adapt/spaghetti-core';
import { RankedCommand, ReportOptions, VisualizationDatasets } from './report-models';
import { scoreThenId } from './ranking';

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
          command.distance.folder,
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
