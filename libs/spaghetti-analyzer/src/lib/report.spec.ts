import { analyzeFile } from '@state-adapt/spaghetti-analysis';

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
});
