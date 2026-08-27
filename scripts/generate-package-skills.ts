import fs from 'node:fs/promises';
import path from 'node:path';

// ---------------------------------------------------------------------------
// StateAdapt-specific configuration
// ---------------------------------------------------------------------------

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const API_DOCS_ROOT = path.join(WORKSPACE_ROOT, 'apps/docs2/docs/api');
const DIST_LIBS_ROOT = path.join(WORKSPACE_ROOT, 'dist/libs');
const EXCLUDED_API_DIRECTORIES = new Set(['typedoc']);
const SKILLS_DIRECTORY_NAME = 'skills';
const REFERENCES_DIRECTORY_NAME = 'references';
const TYPEDOC_SECTIONS_TO_REMOVE = new Set([
  'Extends',
  'Parameters',
  'Returns',
  'Type declaration',
  'Type Parameters',
]);

interface PackageJson {
  name?: string;
  description?: string;
}

interface SkillMarkdownOptions {
  markdownFiles: string[];
  packageDescription?: string;
  packageName: string;
  skillName: string;
}

// ---------------------------------------------------------------------------

async function main() {
  const libraries = await discoverLibraries();
  await preflight(libraries);

  for (const library of libraries) {
    const packageDirectory = path.join(DIST_LIBS_ROOT, library);
    const packageJson: PackageJson = JSON.parse(
      await fs.readFile(path.join(packageDirectory, 'package.json'), 'utf8'),
    );
    const skillName = toSkillName(packageJson.name || library);
    const skillDirectory = path.join(packageDirectory, SKILLS_DIRECTORY_NAME, skillName);
    const referencesDirectory = path.join(skillDirectory, REFERENCES_DIRECTORY_NAME);
    const markdownFiles = await findMarkdownFiles(path.join(API_DOCS_ROOT, library));

    await fs.rm(skillDirectory, { recursive: true, force: true });
    await fs.mkdir(referencesDirectory, { recursive: true });

    for (const relativeFile of markdownFiles) {
      const sourceFile = path.join(API_DOCS_ROOT, library, relativeFile);
      const destinationFile = path.join(referencesDirectory, relativeFile);
      const markdown = await fs.readFile(sourceFile, 'utf8');
      const agentReferenceMarkdown = createAgentReferenceMarkdown(markdown);
      const rewrittenMarkdown = await rewriteApiLinks(
        agentReferenceMarkdown,
        library,
        relativeFile,
      );

      await fs.mkdir(path.dirname(destinationFile), { recursive: true });
      await fs.writeFile(destinationFile, rewrittenMarkdown);
    }

    const skillMarkdown = createSkillMarkdown({
      markdownFiles,
      packageDescription: packageJson.description,
      packageName: packageJson.name || library,
      skillName,
    });
    await fs.writeFile(path.join(skillDirectory, 'SKILL.md'), skillMarkdown);

    console.log(`Generated ${skillName} with ${markdownFiles.length} reference file(s).`);
  }
}

function createAgentReferenceMarkdown(markdown: string): string {
  const withoutFrontmatter = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n+/, '');
  const withoutSourceLocations = withoutFrontmatter.replace(
    /^Defined in:.*(?:\r?\n)?/gm,
    '',
  );
  const lines = withoutSourceLocations.split(/\r?\n/);
  const output: string[] = [];
  let fencedCodeMarker: string | null = null;
  let removedSectionLevel: number | null = null;

  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(```|~~~)/);
    if (fenceMatch) {
      fencedCodeMarker = fencedCodeMarker === fenceMatch[1] ? null : fenceMatch[1];
    }

    const headingMatch = fencedCodeMarker ? null : line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (removedSectionLevel !== null) {
      if (!headingMatch || headingMatch[1].length > removedSectionLevel) continue;
      removedSectionLevel = null;
    }

    if (headingMatch && TYPEDOC_SECTIONS_TO_REMOVE.has(headingMatch[2])) {
      removedSectionLevel = headingMatch[1].length;
      continue;
    }

    output.push(line);
  }

  return consolidateRepeatedCallSignatures(output.join('\n'))
    .replace(/(?<!!)\[([^\]]+)\]\(#[^)]+\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .concat('\n');
}

function consolidateRepeatedCallSignatures(markdown: string): string {
  const callSignatureHeading = /^## Call Signature\s*$/gm;
  const matches = [...markdown.matchAll(callSignatureHeading)];
  if (matches.length < 2) return markdown;

  const prefix = markdown.slice(0, matches[0].index).trimEnd();
  const sections = matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    return markdown.slice(start, end).trim();
  });
  const parsedSections = sections.map(parseCallSignatureSection);
  const sharedBody = parsedSections[0].body;

  if (parsedSections.some(section => !section.signature || section.body !== sharedBody)) {
    return markdown;
  }

  const signatures = parsedSections.map(section => section.signature).join('\n\n');
  return `${prefix}\n\n## Call Signatures\n\n${signatures}\n\n${sharedBody}\n`;
}

function parseCallSignatureSection(section: string): { body: string; signature: string } {
  const lines = section.split('\n');
  const signatureStart = lines.findIndex(line => line.startsWith('> '));
  if (signatureStart === -1) return { body: section, signature: '' };

  let signatureEnd = signatureStart;
  while (lines[signatureEnd + 1]?.startsWith('> ')) signatureEnd += 1;

  return {
    signature: lines
      .slice(signatureStart, signatureEnd + 1)
      .join('\n')
      .trim(),
    body: lines
      .slice(signatureEnd + 1)
      .join('\n')
      .trim(),
  };
}

async function discoverLibraries(): Promise<string[]> {
  const entries = await fs.readdir(API_DOCS_ROOT, { withFileTypes: true });

  return entries
    .filter(entry => entry.isDirectory() && !EXCLUDED_API_DIRECTORIES.has(entry.name))
    .map(entry => entry.name)
    .sort();
}

async function preflight(libraries: string[]): Promise<void> {
  const missingPackages: string[] = [];

  for (const library of libraries) {
    const packageJsonPath = path.join(DIST_LIBS_ROOT, library, 'package.json');

    try {
      await fs.access(packageJsonPath);
    } catch {
      missingPackages.push(path.relative(WORKSPACE_ROOT, packageJsonPath));
    }
  }

  if (missingPackages.length > 0) {
    throw new Error(
      `Build the matching libraries before releasing skills. Missing:\n${missingPackages
        .map(file => `- ${file}`)
        .join('\n')}`,
    );
  }
}

async function findMarkdownFiles(
  directory: string,
  relativeDirectory = '',
): Promise<string[]> {
  const entries = await fs.readdir(path.join(directory, relativeDirectory), {
    withFileTypes: true,
  });
  const files: string[] = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relativePath = path.join(relativeDirectory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findMarkdownFiles(directory, relativePath)));
    } else if (entry.isFile() && path.extname(entry.name) === '.md') {
      const markdown = await fs.readFile(path.join(directory, relativePath), 'utf8');
      if (!isPackageIndexMarkdown(markdown)) files.push(relativePath);
    }
  }

  return files;
}

function isPackageIndexMarkdown(markdown: string): boolean {
  return /^# Package:/m.test(markdown);
}

async function rewriteApiLinks(
  markdown: string,
  library: string,
  relativeFile: string,
): Promise<string> {
  const markdownLinkPattern = /(!?\[[^\]]*\]\()([^)\s]+)([^)]*\))/g;
  const replacements = await Promise.all(
    [...markdown.matchAll(markdownLinkPattern)].map(async match => {
      const rewrittenTarget = await rewriteApiLinkTarget(match[2], library, relativeFile);
      return {
        index: match.index,
        length: match[0].length,
        value: `${match[1]}${rewrittenTarget}${match[3]}`,
      };
    }),
  );

  let output = markdown;
  for (const replacement of replacements.reverse()) {
    output =
      output.slice(0, replacement.index) +
      replacement.value +
      output.slice(replacement.index + replacement.length);
  }
  return output;
}

async function rewriteApiLinkTarget(
  target: string,
  library: string,
  relativeFile: string,
): Promise<string> {
  if (
    target.startsWith('#') ||
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('mailto:')
  ) {
    return target;
  }

  const suffixIndex = target.search(/[?#]/);
  const pathname = suffixIndex === -1 ? target : target.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? '' : target.slice(suffixIndex);
  let apiRelativeTarget: string;

  if (pathname.startsWith('/api/')) {
    apiRelativeTarget = pathname.slice('/api/'.length);
  } else if (!pathname.startsWith('/')) {
    apiRelativeTarget = path.relative(
      API_DOCS_ROOT,
      path.resolve(API_DOCS_ROOT, library, path.dirname(relativeFile), pathname),
    );
  } else {
    return target;
  }

  if (apiRelativeTarget.startsWith('..') || path.isAbsolute(apiRelativeTarget)) {
    return target;
  }

  const [targetLibrary, ...targetParts] = apiRelativeTarget.split(path.sep);
  if (!targetLibrary || EXCLUDED_API_DIRECTORIES.has(targetLibrary)) {
    return target;
  }

  const normalizedTargetParts = await resolveMarkdownTarget(targetLibrary, targetParts);
  if (!normalizedTargetParts) return target;

  const sourceSkillName = await getSkillName(library);
  const targetSkillName = await getSkillName(targetLibrary);
  const installedSourceFile = path.join(
    sourceSkillName,
    REFERENCES_DIRECTORY_NAME,
    relativeFile,
  );
  const installedTargetFile = path.join(
    targetSkillName,
    REFERENCES_DIRECTORY_NAME,
    ...normalizedTargetParts,
  );
  let rewrittenPath = path.relative(
    path.dirname(installedSourceFile),
    installedTargetFile,
  );

  if (!rewrittenPath.startsWith('.')) rewrittenPath = `./${rewrittenPath}`;
  return `${toPosixPath(rewrittenPath)}${suffix}`;
}

async function resolveMarkdownTarget(
  library: string,
  targetParts: string[],
): Promise<string[] | null> {
  let targetPath = path.join(API_DOCS_ROOT, library, ...targetParts);

  try {
    const stats = await fs.stat(targetPath);
    if (stats.isDirectory()) targetPath = path.join(targetPath, 'index.md');
  } catch {
    return null;
  }

  if (path.extname(targetPath) !== '.md') return null;
  return path.relative(path.join(API_DOCS_ROOT, library), targetPath).split(path.sep);
}

async function getSkillName(library: string): Promise<string> {
  const packageJson: PackageJson = JSON.parse(
    await fs.readFile(path.join(DIST_LIBS_ROOT, library, 'package.json'), 'utf8'),
  );
  return toSkillName(packageJson.name || library);
}

function toSkillName(packageName: string): string {
  return packageName
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function createSkillMarkdown({
  markdownFiles,
  packageDescription,
  packageName,
  skillName,
}: SkillMarkdownOptions): string {
  const description = [
    `Use ${packageName} accurately with its packaged API documentation.`,
    packageDescription,
    `Use when implementing, debugging, reviewing, or answering questions about ${packageName}.`,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ');
  const groupedFiles = groupBy(markdownFiles, file => path.dirname(file));
  const referenceSections = [...groupedFiles.entries()]
    .map(([directory, files]) => {
      const heading = directory === '.' ? 'API' : toPosixPath(directory);
      const links = files
        .map(file => {
          const label = path.basename(file, '.md');
          return `- [${label}](${REFERENCES_DIRECTORY_NAME}/${toPosixPath(file)})`;
        })
        .join('\n');
      return `### ${heading}\n\n${links}`;
    })
    .join('\n\n');

  return `---
name: ${skillName}
description: ${JSON.stringify(description)}
---

## StateAdapt Guide

Move logic as far downstream/colocated as possible. Derive as much as possible. Do not store duplicate/redundant state.

Prefer reactive/declarative code. Avoid unnecessary callbacks/effects. Minimize number of imperative statements.

Inline event callbacks in JSX/templates.
Only make 1 imperative call per event callback unless completely unavoidable. Ideally, directly trigger only 1 change
per event callback. Minimal event pre-processing like e.preventDefault() is okay.

## References

Use these references as the source of truth for ${packageName} and follow the patterns established in the examples:

${referenceSections}
`;
}

function groupBy<T, K>(values: T[], getKey: (value: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const value of values) {
    const key = getKey(value);
    groups.set(key, [...(groups.get(key) || []), value]);
  }
  return groups;
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
