import * as ts from 'typescript';
import { Command, CommandHop, FunctionAnalysis, SourceLocation } from './models';
import { ResolvedResource } from './resource-resolution';
import { Scope } from './scopes';

export const MODULE_FUNCTION_NAME = '<module>';

export interface ImportBinding {
  moduleName: string;
  importedName: string;
  namespace: boolean;
}
export interface CallSite {
  node: ts.CallExpression;
  location: SourceLocation;
  directCommandLocation?: SourceLocation;
  name: string;
  namespace?: string;
}
export interface FunctionDraft extends FunctionAnalysis {
  node: ts.FunctionLikeDeclaration | ts.SourceFile;
  sourceFile: ts.SourceFile;
  scopes: Map<ts.Node, Scope>;
  directCommands: Command[];
  calls: CallSite[];
  jsxEventHandler: boolean;
}
export interface CallEdge {
  callee: FunctionDraft;
  hop: CommandHop;
  /** Caller-side value origins for the callee's parameters. */
  arguments: Array<ResolvedResource | undefined>;
}
export interface FileDraft {
  sourceFile: ts.SourceFile;
  functions: FunctionDraft[];
  imports: Map<string, ImportBinding>;
}
