import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

export const defaultCompilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.Latest,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  jsx: ts.JsxEmit.Preserve,
  allowJs: true,
  skipLibCheck: true,
};
const memoryProgramCache = new Map<string, ts.Program>();

export function createMemoryProgram(
  sources: Array<{ filePath: string; sourceText: string }>,
): ts.Program {
  const cacheKey = sources
    .map(source => `${source.filePath}\0${source.sourceText}`)
    .join('\0\0');
  const cached = memoryProgramCache.get(cacheKey);
  if (cached) return cached;
  const host = ts.createCompilerHost(defaultCompilerOptions, true);
  const sourceByPath = new Map<string, { filePath: string; sourceText: string }>();
  sources.forEach(source => {
    sourceByPath.set(source.filePath, source);
    sourceByPath.set(path.resolve(source.filePath), source);
  });
  const originalGetSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    const source = sourceByPath.get(fileName) ?? sourceByPath.get(path.resolve(fileName));
    return source
      ? ts.createSourceFile(
          source.filePath,
          source.sourceText,
          languageVersion,
          true,
          scriptKind(source.filePath),
        )
      : originalGetSourceFile(fileName, languageVersion, onError, shouldCreate);
  };
  const originalFileExists = host.fileExists.bind(host);
  const originalReadFile = host.readFile.bind(host);
  host.fileExists = fileName =>
    sourceByPath.has(fileName) ||
    sourceByPath.has(path.resolve(fileName)) ||
    originalFileExists(fileName);
  host.readFile = fileName =>
    (sourceByPath.get(fileName) ?? sourceByPath.get(path.resolve(fileName)))
      ?.sourceText ?? originalReadFile(fileName);
  const program = ts.createProgram(
    sources.map(source => source.filePath),
    defaultCompilerOptions,
    host,
  );
  memoryProgramCache.set(cacheKey, program);
  if (memoryProgramCache.size > 5)
    memoryProgramCache.delete(memoryProgramCache.keys().next().value as string);
  return program;
}
export function scriptKind(filePath: string): ts.ScriptKind {
  if (filePath.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (filePath.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (filePath.endsWith('.js')) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}
export function collectFiles(
  directory: string,
  extensions: string[],
  exclude: (string | RegExp)[],
): string[] {
  if (excluded(directory, exclude)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => {
      const target = path.join(directory, entry.name);
      if (excluded(target, exclude)) return [];
      if (entry.isDirectory()) {
        if (['node_modules', 'dist', 'coverage', '.git'].includes(entry.name)) return [];
        return collectFiles(target, extensions, exclude);
      }
      return extensions.some(extension => entry.name.endsWith(extension)) ? [target] : [];
    });
}
function excluded(filePath: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some(pattern =>
    typeof pattern === 'string' ? filePath.includes(pattern) : pattern.test(filePath),
  );
}
