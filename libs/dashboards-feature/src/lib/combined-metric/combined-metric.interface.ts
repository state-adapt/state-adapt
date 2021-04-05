import { Metric } from '../metric/metric.interface';

export interface CombinedMetric {
  id: string;
  title: string;
  metrics: Metric[];
  expression: string;
}
