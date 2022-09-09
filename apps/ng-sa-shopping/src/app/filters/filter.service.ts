import { Injectable } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { filters } from '../../../../../libs/shopping/src';
import { filterAdapter } from './filter.adapter';

@Injectable({ providedIn: 'root' })
export class FilterService {
  filterStore = adapt(['filters', filters], filterAdapter);
}
