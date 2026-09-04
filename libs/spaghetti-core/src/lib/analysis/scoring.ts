import {
  AnalysisOptions,
  CommandHop,
  CommandKind,
  Distance,
  ScoreBreakdown,
  ScoreContribution,
  ScoreFactor,
  ScoringConfig,
  SourceLocation,
  defaultScoring,
} from './models';

export function addDistance(left: Distance, right: Distance): Distance {
  return {
    declarationLine: left.declarationLine + right.declarationLine,
    sameFunction: left.sameFunction + right.sameFunction,
    scope: left.scope + right.scope,
    functionCall: left.functionCall + right.functionCall,
    file: left.file + right.file,
    folder: left.folder + right.folder,
  };
}

export function locationStartKey(location: SourceLocation): string {
  return `${location.start.line}:${location.start.column}`;
}

function contribution(
  factor: ScoreFactor,
  layer: string,
  distance: number,
  weight: number,
): ScoreContribution {
  return { factor, layer, distance, weight, value: distance * weight };
}

export function directScoreBreakdown(
  kind: CommandKind,
  apiPenalty: number | undefined,
  external: boolean,
  distance: Distance,
  functionSize: number,
  scoring: ScoringConfig,
): ScoreBreakdown {
  const base = apiPenalty ?? scoring.baseScores[kind];
  const contributions: ScoreContribution[] = [
    { factor: 'base', layer: 'origin', value: base },
    contribution(
      'declaration-line-distance',
      'origin',
      distance.declarationLine,
      scoring.declarationLineDistanceWeight,
    ),
    contribution(
      'scope-crossings',
      'origin',
      distance.scope,
      scoring.scopeCrossingWeight,
    ),
    contribution('file-crossings', 'origin', distance.file, scoring.fileCrossingWeight),
    contribution(
      'folder-crossings',
      'origin',
      distance.folder,
      scoring.folderCrossingWeight,
    ),
    contribution(
      'same-function-distance',
      'origin',
      distance.sameFunction,
      scoring.sameFunctionDistanceWeight,
    ),
    contribution('function-size', 'origin', functionSize, scoring.functionSizeWeight),
    {
      factor: 'external',
      layer: 'origin',
      value: external && apiPenalty === undefined ? scoring.externalPenalty : 0,
    },
  ];
  return breakdownFrom(contributions);
}

function hopContributions(hop: CommandHop, scoring: ScoringConfig): ScoreContribution[] {
  const contributions = [
    contribution(
      'declaration-line-distance',
      hop.caller,
      hop.distance.declarationLine,
      scoring.declarationLineDistanceWeight,
    ),
    contribution(
      'function-call-distance',
      hop.caller,
      hop.distance.functionCall,
      scoring.functionCallDistanceWeight,
    ),
    contribution(
      'scope-crossings',
      hop.caller,
      hop.distance.scope,
      scoring.scopeCrossingWeight,
    ),
    contribution(
      'file-crossings',
      hop.caller,
      hop.distance.file,
      scoring.fileCrossingWeight,
    ),
    contribution(
      'folder-crossings',
      hop.caller,
      hop.distance.folder,
      scoring.folderCrossingWeight,
    ),
    contribution(
      'same-function-distance',
      hop.caller,
      hop.distance.sameFunction,
      scoring.sameFunctionDistanceWeight,
    ),
  ];
  return contributions;
}

export function inheritScoreBreakdown(
  breakdown: ScoreBreakdown,
  hop: CommandHop,
  scoring: ScoringConfig,
): ScoreBreakdown {
  return breakdownFrom([...hopContributions(hop, scoring), ...breakdown.contributions]);
}

function breakdownFrom(contributions: ScoreContribution[]): ScoreBreakdown {
  const sum = (factor: ScoreFactor): number =>
    contributions
      .filter(item => item.factor === factor)
      .reduce((total, item) => total + item.value, 0);
  return {
    base: sum('base'),
    external: sum('external'),
    declarationLineDistance: sum('declaration-line-distance'),
    functionCallDistance: sum('function-call-distance'),
    scopeCrossings: sum('scope-crossings'),
    fileCrossings: sum('file-crossings'),
    folderCrossings: sum('folder-crossings'),
    sameFunctionDistance: sum('same-function-distance'),
    functionSize: sum('function-size'),
    total: contributions.reduce((total, item) => total + item.value, 0),
    contributions,
  };
}

export function scoringConfig(options: AnalysisOptions): ScoringConfig {
  const supplied = options.scoring ?? {};
  return {
    ...defaultScoring,
    ...supplied,
    baseScores: { ...defaultScoring.baseScores, ...supplied.baseScores },
  };
}
