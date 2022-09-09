import { Injectable } from '@angular/core';
import { AdaptCommon } from '@state-adapt/angular';
import { filters } from '../../../../../libs/shopping/src';
import { filterAdapter } from './filter.adapter';

@Injectable({ providedIn: 'root' })
export class FilterService {
  filterStore = this.adapt.init('filters', filters, filterAdapter);

  constructor(private adapt: AdaptCommon<any>) {}
}
