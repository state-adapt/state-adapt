import * as ts from 'typescript';
import {
  Command,
  CommandHop,
  Distance,
  FunctionAnalysis,
  SourceLocation,
} from './models';
import { ResolvedResource, RestElementBinding } from './resource-resolution';
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
export interface CommandDraft extends Command {
  /** Resource-only distance at the command origin, before call-hop distances. */
  resourceDistance: Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'>;
  /** Internal rest-element flow metadata, removed from public results. */
  restElements: RestElementBinding[];
  /** Internal signal that resource provenance reached its configured trace limit. */
  resourceTraceTruncated?: boolean;
}
export interface AllocationEscape {
  allocation: SourceLocation;
  location: SourceLocation;
}
export interface FunctionDraft extends FunctionAnalysis {
  node: ts.FunctionLikeDeclaration | ts.SourceFile;
  sourceFile: ts.SourceFile;
  scopes: Map<ts.Node, Scope>;
  commands: CommandDraft[];
  directCommands: CommandDraft[];
  calls: CallSite[];
  /** Storage escapes for allocations owned by this function, in source order. */
  allocationEscapes: AllocationEscape[];
  jsxEventHandler: boolean;
}
export interface CallEdge {
  callee: FunctionDraft;
  hop: CommandHop;
  /** Caller-side value origin for one callee parameter, resolved on first use. */
  argument(
    parameterIndex: number,
    restElementIndex?: number | null,
  ): ResolvedResource | undefined;
}
export interface FileDraft {
  sourceFile: ts.SourceFile;
  functions: FunctionDraft[];
  imports: Map<string, ImportBinding>;
}
