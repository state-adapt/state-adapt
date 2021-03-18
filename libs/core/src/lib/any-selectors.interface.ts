import { MemoizedSelector } from '@ngrx/store';

export interface AnySelectors {
  [index: string]: ((state: any) => any) | MemoizedSelector<any, any>;
}
