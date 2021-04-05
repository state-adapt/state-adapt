import { Filter } from '../filter/filter.interface';

export interface Metric {
  type: string;
  title: string;
  description: string;
  criteria: Filter[];
}
