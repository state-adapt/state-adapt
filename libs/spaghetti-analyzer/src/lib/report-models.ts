import {
  AnalysisOptions as CoreAnalysisOptions,
  FunctionAnalysis,
  ProjectAnalysis as CoreProjectAnalysis,
} from '@state-adapt/spaghetti-core';

/** Options that control project discovery, command recognition, and scoring. */
export type AnalysisOptions = CoreAnalysisOptions;

/** The project-level analysis accepted by `reportFromAnalysis`. */
export type ProjectAnalysis = CoreProjectAnalysis;

/** Aggregate score for one directory. */
export interface DirectoryScore {
  /** Directory path relative to the analyzed project root. */
  directory: string;
  /** Sum of file scores in the directory. */
  score: number;
  /** Number of analyzed files in the directory. */
  files: number;
  /** Number of commands found in the directory. */
  commands: number;
}

/** A complete analyzer report, including ranked visualization datasets. */
export interface SpaghettiReport {
  /** Complete project analysis used to create the report. */
  project: ProjectAnalysis;
  /** Aggregate scores for directories containing analyzed files. */
  directoryScores: DirectoryScore[];
  /** Functions ordered from highest to lowest score. */
  functionScores: Array<Pick<FunctionAnalysis, 'functionId' | 'name' | 'score' | 'size'>>;
  /** Ranked datasets for charts, tables, or custom dashboards. */
  visualizations: VisualizationDatasets;
}

/** A caller-owned score snapshot used to build a trend dataset. */
export interface HistoricalSnapshot {
  /** Display name for this snapshot. */
  label: string;
  /** Project score captured by the caller. */
  score: number;
  /** Optional timestamp supplied by the caller. */
  timestamp?: string;
}

/** Options for ranking and labeling report visualization data. */
export interface ReportOptions {
  /** Maximum rows in each ranked visualization dataset. */
  top?: number;
  /** Caller-owned history. Reporting never writes snapshots implicitly. */
  history?: HistoricalSnapshot[];
  /** Label for the current project score. Defaults to `"current"`. */
  currentLabel?: string;
  /** Optional timestamp for the current project score. */
  currentTimestamp?: string;
}

/** A command projected into a sortable visualization row. */
export interface RankedCommand {
  /** Stable identifier of the function containing the command. */
  functionId: string;
  /** Display name of the function containing the command. */
  functionName: string;
  /** Source file containing the command. */
  filePath: string;
  /** Detected command kind. */
  kind: string;
  /** Aggregate spaghetti score for the command. */
  score: number;
  /** Sum of the command's unweighted distance dimensions. */
  distance: number;
  /** Number of calls between the reported function and the command. */
  chainLength: number;
  /** Function where the command originates. */
  originFunction: string;
}

/** Ranked datasets ready for tables, charts, or custom dashboards. */
export interface VisualizationDatasets {
  /** Commands with the highest spaghetti scores. */
  hotspots: RankedCommand[];
  /** Functions with the highest aggregate scores. */
  highestScoringFunctions: Array<{
    functionId: string;
    name: string;
    filePath: string;
    score: number;
    commands: number;
  }>;
  /** Files with the highest aggregate scores. */
  highestScoringFiles: Array<{ filePath: string; score: number; commands: number }>;
  /** Commands with the longest propagated call chains. */
  longestCommandChains: RankedCommand[];
  /** Commands with the largest total distance. */
  largestCommandDistances: RankedCommand[];
  /** Caller-provided historical scores plus the current score and deltas. */
  scoreTrend: Array<HistoricalSnapshot & { delta: number | null }>;
}
