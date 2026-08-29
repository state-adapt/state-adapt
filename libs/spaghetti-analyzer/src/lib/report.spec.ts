import { analyzeFile } from '@state-adapt/spaghetti-core';

import { formatHumanReport, formatJsonReport, reportFromAnalysis } from './report';

describe('spaghetti reporting', () => {
  const file = analyzeFile(
    'let shared = 0;\nexport function update() { shared++; external(); }',
    '/project/src/update.ts',
  );
  const report = reportFromAnalysis({
    rootDir: '/project',
    files: [file],
    score: file.score,
  });

  it('aggregates file, directory, function and whole-project scores', () => {
    expect(report.project.score).toBeGreaterThan(0);
    expect(report.functionScores[0]).toMatchObject({ name: 'update', size: 1 });
    expect(report.directoryScores[0]).toMatchObject({
      directory: 'src',
      files: 1,
      commands: 2,
    });
  });

  it('renders human-readable command distance details', () => {
    expect(formatHumanReport(report)).toContain(
      'distance(line=1, scope=1, calls=0, files=0)',
    );
    expect(formatHumanReport(report)).toContain('Directories');
    expect(formatHumanReport(report)).toContain('[base=2, declaration=0.10');
  });

  it('renders inherited command chains', () => {
    const chainedFile = analyzeFile(
      `function effect() { window.value = 1; }
export function run() { effect(); }`,
      '/project/src/chained.ts',
    );
    const chainedReport = reportFromAnalysis({
      rootDir: '/project',
      files: [chainedFile],
      score: chainedFile.score,
    });

    expect(formatHumanReport(chainedReport)).toContain(
      'chain=/project/src/chained.ts:run@2 -> /project/src/chained.ts:effect@1',
    );
    const json = JSON.parse(formatJsonReport(chainedReport));
    expect(json.project.files[0].functions[1].commands[0].callPath).toHaveLength(1);
  });

  it('renders complete machine-readable JSON', () => {
    const json = JSON.parse(formatJsonReport(report));
    expect(json.project.files[0].functions[0].commands).toHaveLength(2);
    expect(json.directoryScores[0].directory).toBe('src');
  });

  it('identifies recognized APIs in human and JSON reports', () => {
    const apiFile = analyzeFile(
      'const items = []; function append() { items.push(1); }',
      '/project/src/api.ts',
    );
    const apiReport = reportFromAnalysis({
      rootDir: '/project',
      files: [apiFile],
      score: apiFile.score,
    });

    expect(formatHumanReport(apiReport)).toContain('api-command (Array.push)');
    expect(
      JSON.parse(formatJsonReport(apiReport)).project.files[0].commands[0],
    ).toMatchObject({ api: 'Array.push', recognizer: 'javascript' });
  });

  it('provides deterministic, top-limited visualization datasets', () => {
    const limited = reportFromAnalysis(report.project, { top: 1 });

    expect(limited.visualizations.hotspots).toHaveLength(1);
    expect(limited.visualizations.highestScoringFunctions).toHaveLength(1);
    expect(limited.visualizations.highestScoringFiles).toHaveLength(1);
    expect(limited.visualizations.largestCommandDistances[0]).toMatchObject({
      functionName: 'update',
      originFunction: expect.any(String),
    });
    expect(formatHumanReport(limited)).toContain('Spaghetti hotspots');
    expect(formatHumanReport(limited)).toContain('Largest command distances');
  });

  it('ranks inherited chains and computes caller-owned score trends', () => {
    const chainedFile = analyzeFile(
      `function leaf() { window.value = 1; }
function middle() { leaf(); }
function root() { middle(); }`,
      '/project/src/chains.ts',
    );
    const trendReport = reportFromAnalysis(
      { rootDir: '/project', files: [chainedFile], score: chainedFile.score },
      {
        top: 2,
        history: [
          { label: 'v1', score: 5 },
          { label: 'v2', score: 8, timestamp: '2026-01-01T00:00:00Z' },
        ],
        currentLabel: 'working tree',
      },
    );

    expect(trendReport.visualizations.longestCommandChains[0].chainLength).toBe(2);
    expect(trendReport.visualizations.scoreTrend).toEqual([
      { label: 'v1', score: 5, delta: null },
      { label: 'v2', score: 8, timestamp: '2026-01-01T00:00:00Z', delta: 3 },
      { label: 'working tree', score: chainedFile.score, delta: chainedFile.score - 8 },
    ]);
  });

  it('renders useful empty datasets and reports', () => {
    const empty = reportFromAnalysis({ rootDir: '/empty', files: [], score: 0 });

    expect(empty.visualizations.hotspots).toEqual([]);
    expect(empty.visualizations.highestScoringFunctions).toEqual([]);
    expect(empty.visualizations.scoreTrend).toEqual([
      { label: 'current', score: 0, delta: null },
    ]);
    expect(formatHumanReport(empty)).toContain('(none)');
  });
});
