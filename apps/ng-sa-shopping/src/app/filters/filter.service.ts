import { Injectable } from '@angular/core';
import { AdaptCommon, Source } from '@state-adapt/core';
import { Filters, filters } from '../../../../../libs/shopping/src';
import { filterAdapter } from './filter.adapter';

@Injectable({ providedIn: 'root' })
export class FilterService {
  filterStore = this.adapt.init('filters', filters, filterAdapter);

  constructor(private adapt: AdaptCommon<any>) {}
}
