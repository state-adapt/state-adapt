import { Filter } from '../filter/filter.interface';
import { GridItem } from '../grid-item/grid-item.interface';
import { Metric } from '../metric/metric.interface';

export enum CardFormat {
  Simple = 'SIMPLE', // No line separation, each independent
  Table = 'TABLE',
}

export interface Card {
  id: number;
  title: string;
  type: CardFormat;
  gridItem: GridItem;
  metrics: {
    metric: Metric;
    filterTo: Filter[];
    expandBy: Filter;
  }[];
  filterAllTo: Filter[];
  expandAllBy: Filter;
}
