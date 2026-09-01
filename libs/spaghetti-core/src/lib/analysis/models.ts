import * as ts from 'typescript';

import {
  ApiCommandPattern,
  BuiltInRecognizerName,
  CommandRecognizer,
} from '../recognizers';

export type CommandKind =
  | 'discarded-call'
  | 'assignment'
  | 'property-assignment'
  | 'increment'
  | 'decrement'
  | 'delete'
  | 'api-command';

export interface SourceLocation {
  filePath: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
}
export interface Distance {
  /** Lines between a command and the declaration of its resource. */
  declarationLine: number;
  /** Caller-local offsets from function starts to command/call sites. */
  sameFunction: number;
  scope: number;
  functionCall: number;
  file: number;
  folder: number;
}
export type ScoreFactor =
  | 'base'
  | 'declaration-line-distance'
  | 'function-call-distance'
  | 'scope-crossings'
  | 'file-crossings'
  | 'folder-crossings'
  | 'same-function-distance'
  | 'function-size';
export interface ScoreContribution {
  factor: ScoreFactor;
  value: number;
  /** `origin` for the command itself; otherwise the caller function id. */
  layer: string;
  distance?: number;
  weight?: number;
}
export interface ScoreBreakdown {
  base: number;
  declarationLineDistance: number;
  functionCallDistance: number;
  scopeCrossings: number;
  fileCrossings: number;
  folderCrossings: number;
  sameFunctionDistance: number;
  functionSize: number;
  total: number;
  /** Ordered, additive evidence; inherited layers are prepended caller-first. */
  contributions: ScoreContribution[];
}
export interface CommandHop {
  caller: string;
  callee: string;
  callLocation: SourceLocation;
  definitionLocation: SourceLocation;
  distance: Distance;
}
export interface Declaration {
  name: string;
  kind: 'variable' | 'parameter' | 'function' | 'import' | 'class' | 'unknown';
  location: SourceLocation;
}
export interface Command {
  kind: CommandKind;
  location: SourceLocation;
  originFunction: string;
  callPath: CommandHop[];
  distance: Distance;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  resource?: string;
  /** Stable API name supplied by the recognizer for API commands. */
  api?: string;
  /** Name of the recognizer that identified the API command. */
  recognizer?: string;
  /** Stable source-level name for a call, such as `notify` or `event.preventDefault`. */
  call?: string;
  /** The command targets a resource or implementation outside the analyzed program. */
  external?: boolean;
  declaration?: Declaration;
  remote: boolean;
}
export interface FunctionAnalysis {
  functionId: string;
  name: string;
  location: SourceLocation;
  size: number;
  commands: Command[];
  score: number;
  /** Neutral context metadata; consumers decide whether event handlers get exceptions. */
  jsxEventHandler?: boolean;
  /** True when maxCommandsPerFunction truncated materialized command paths. */
  truncated?: boolean;
}
export interface FileAnalysis {
  filePath: string;
  functions: FunctionAnalysis[];
  commands: Command[];
  score: number;
  /** True when at least one function has incomplete command propagation. */
  truncated?: boolean;
}
export interface ProjectAnalysis {
  rootDir: string;
  files: FileAnalysis[];
  score: number;
  /** True when configured limits made the project analysis incomplete. */
  truncated?: boolean;
}

export interface ScoringConfig {
  baseScores: Record<CommandKind, number>;
  /** Optional exact API-name overrides for api-command base scores. */
  apiBaseScores: Record<string, number>;
  declarationLineDistanceWeight: number;
  sameFunctionDistanceWeight: number;
  scopeCrossingWeight: number;
  fileCrossingWeight: number;
  folderCrossingWeight: number;
  functionCallDistanceWeight: number;
  functionSizeWeight: number;
}

export interface AnalysisOptions {
  scoring?: Partial<Omit<ScoringConfig, 'baseScores' | 'apiBaseScores'>> & {
    baseScores?: Partial<Record<CommandKind, number>>;
    apiBaseScores?: Record<string, number>;
  };
  extensions?: string[];
  exclude?: (string | RegExp)[];
  /** Programmatic extension point. These run before declarative and built-in recognizers. */
  recognizers?: CommandRecognizer[];
  /** JSON-friendly custom API command definitions, suitable for config files. */
  apiPatterns?: ApiCommandPattern[];
  /** Select built-in families. All families are enabled by default. */
  builtInRecognizers?: BuiltInRecognizerName[];
  /** Reuse an existing compiler program, such as the one supplied by typescript-eslint. */
  program?: ts.Program;
  /** Predictable upper bound for inherited call-chain expansion. */
  maxCallDepth?: number;
  /** Predictable upper bound for materialized commands in each analyzed function. */
  maxCommandsPerFunction?: number;
  /** Disable propagation across files while retaining checker-backed local analysis. */
  crossFileAnalysis?: boolean;
  /** Stop expanding a resolved call once its weighted call-boundary distance exceeds this limit. */
  maxCallBoundaryScore?: number;
}

export const defaultScoring: ScoringConfig = {
  baseScores: {
    'discarded-call': 1,
    assignment: 2,
    'property-assignment': 3,
    increment: 2,
    decrement: 2,
    delete: 4,
    'api-command': 3,
  },
  apiBaseScores: {},
  declarationLineDistanceWeight: 0.1,
  sameFunctionDistanceWeight: 0,
  scopeCrossingWeight: 2,
  fileCrossingWeight: 0,
  folderCrossingWeight: 0,
  functionCallDistanceWeight: 0,
  functionSizeWeight: 0,
};
