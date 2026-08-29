import { SpaghettiReport } from './report-models';

export function formatJsonReport(report: SpaghettiReport, pretty = true): string {
  return JSON.stringify(report, null, pretty ? 2 : undefined);
}
