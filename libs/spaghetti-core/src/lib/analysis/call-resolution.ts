import * as path from 'node:path';
import * as ts from 'typescript';
import { Distance } from './models';
import { CallSite, FileDraft, FunctionDraft, ImportBinding } from './internal-types';
import { isFunction, locationOf } from './ast';
import { defaultExportName, exportedName } from './recognizer-config';
import { resolveDeclaration } from './scopes';

export function resolveCall(
  call: CallSite,
  caller: FunctionDraft,
  callerFile: FileDraft,
  files: FileDraft[],
  checker: ts.TypeChecker,
): FunctionDraft | undefined {
  const declaration = checker.getResolvedSignature(call.node)?.declaration;
  const declarationFunction =
    declaration && isFunction(declaration) ? declaration : undefined;
  if (declarationFunction) {
    const declarationFile = declarationFunction.getSourceFile();
    const start = locationOf(declarationFunction, declarationFile).start;
    const resolved = files
      .find(file => file.sourceFile === declarationFile)
      ?.functions.find(
        fn =>
          fn.location.start.line === start.line &&
          fn.location.start.column === start.column,
      );
    if (resolved) return resolved;
  }
  if (call.namespace) {
    const binding = callerFile.imports.get(call.namespace);
    if (!binding?.namespace) return undefined;
    return resolveImportedFunction(binding.moduleName, call.name, callerFile, files);
  }
  const imported = callerFile.imports.get(call.name);
  if (imported && !imported.namespace)
    return resolveImportedFunction(
      imported.moduleName,
      imported.importedName,
      callerFile,
      files,
    );
  const resolution = resolveDeclaration(call.name, caller.scopes.get(call.node));
  const candidates = callerFile.functions.filter(
    candidate => candidate.name === call.name,
  );
  if (!resolution) return candidates.length === 1 ? candidates[0] : undefined;
  return (
    candidates.find(
      candidate =>
        candidate.location.start.line === resolution.declaration.location.start.line,
    ) ?? (candidates.length === 1 ? candidates[0] : undefined)
  );
}

function resolveImportedFunction(
  moduleName: string,
  importedName: string,
  callerFile: FileDraft,
  files: FileDraft[],
): FunctionDraft | undefined {
  const target = resolveModuleFile(moduleName, callerFile.sourceFile.fileName, files);
  if (!target) return undefined;
  if (importedName === 'default') {
    const defaultName = defaultExportName(target.sourceFile);
    if (defaultName) return target.functions.find(fn => fn.name === defaultName);
    return target.functions.length === 1 ? target.functions[0] : undefined;
  }
  return target.functions.find(
    fn => fn.name === exportedName(target.sourceFile, importedName),
  );
}

function resolveModuleFile(
  moduleName: string,
  callerPath: string,
  files: FileDraft[],
): FileDraft | undefined {
  if (!moduleName.startsWith('.')) return undefined;
  const requested = path.resolve(path.dirname(callerPath), moduleName);
  const requestedExtension = path.extname(requested);
  const requestedStem = ['.ts', '.tsx', '.js', '.jsx'].includes(requestedExtension)
    ? requested.slice(0, -requestedExtension.length)
    : requested;
  return files.find(file => {
    const filePath = path.resolve(file.sourceFile.fileName);
    const extension = path.extname(filePath);
    return (
      filePath === requested ||
      filePath.slice(0, -extension.length) === requestedStem ||
      (path.dirname(filePath) === requested &&
        path.basename(filePath, extension) === 'index')
    );
  });
}

export function collectImports(sourceFile: ts.SourceFile): Map<string, ImportBinding> {
  const imports = new Map<string, ImportBinding>();
  sourceFile.statements.forEach(statement => {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    )
      return;
    const moduleName = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (!clause) return;
    if (clause.name)
      imports.set(clause.name.text, {
        moduleName,
        importedName: 'default',
        namespace: false,
      });
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings))
      imports.set(bindings.name.text, { moduleName, importedName: '*', namespace: true });
    else if (bindings)
      bindings.elements.forEach(element =>
        imports.set(element.name.text, {
          moduleName,
          importedName: element.propertyName?.text ?? element.name.text,
          namespace: false,
        }),
      );
  });
  return imports;
}

export function hopDistance(
  call: CallSite,
  caller: FunctionDraft,
  callee: FunctionDraft,
): Distance {
  const sameFile = caller.sourceFile.fileName === callee.sourceFile.fileName;
  const folder = folderDistance(
    path.dirname(path.resolve(caller.sourceFile.fileName)),
    path.dirname(path.resolve(callee.sourceFile.fileName)),
  );
  const resolution = resolveDeclaration(
    call.namespace ?? call.name,
    caller.scopes.get(call.node),
  );
  return {
    declarationLine: sameFile
      ? Math.abs(call.location.start.line - callee.location.start.line)
      : 0,
    sameFunction: Math.max(0, call.location.start.line - caller.location.start.line),
    scope: resolution?.scopeDistance ?? 0,
    functionCall: 1,
    file: sameFile ? 0 : 1,
    folder,
  };
}

export function folderDistance(left: string, right: string): number {
  const leftParts = left.split(path.sep).filter(Boolean);
  const rightParts = right.split(path.sep).filter(Boolean);
  let shared = 0;
  while (leftParts[shared] === rightParts[shared] && shared < leftParts.length) shared++;
  return leftParts.length + rightParts.length - shared * 2;
}
