import { adaptInjectable } from '@state-adapt/angular';
import { filters } from '@state-adapt/shopping';
import { filterAdapter } from './filter.adapter';

export const injectFilterStore = adaptInjectable(filters, filterAdapter);
