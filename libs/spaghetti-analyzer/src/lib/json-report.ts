import { SpaghettiReport } from './report-models';

/** Serialize a report as pretty-printed or compact JSON. */
export function formatJsonReport(report: SpaghettiReport, pretty = true): string {
  return JSON.stringify(report, null, pretty ? 2 : undefined);
}
