import * as ts from 'typescript';
import { Command, FunctionAnalysis, SourceLocation } from './models';
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
  sourceFile: ts.SourceFile;
  scopes: Map<ts.Node, Scope>;
  directCommands: Command[];
  calls: CallSite[];
  jsxEventHandler: boolean;
}
export interface FileDraft {
  sourceFile: ts.SourceFile;
  functions: FunctionDraft[];
  imports: Map<string, ImportBinding>;
}
