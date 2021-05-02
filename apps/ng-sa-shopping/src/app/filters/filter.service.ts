import { Injectable } from '@angular/core';
import { AdaptCommon, Source } from '@state-adapt/core';
import { Filters, filters } from '../../../../../libs/shopping/src';
import { filterAdapter } from './filter.adapter';

@Injectable({ providedIn: 'root' })
export class FilterService {
  filterToggle$ = new Source<keyof Filters>('[products] filterToggle$');
  filterStore = this.adapt.init(['filters', filterAdapter, filters], {
    toggleFilter: this.filterToggle$,
  });

  constructor(private adapt: AdaptCommon<any>) {}
}
