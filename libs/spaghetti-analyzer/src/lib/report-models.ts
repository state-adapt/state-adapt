import { FunctionAnalysis, ProjectAnalysis } from '@state-adapt/spaghetti-core';

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
