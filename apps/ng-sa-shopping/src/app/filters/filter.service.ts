import { adaptInjectable } from '@state-adapt/angular';
import { filters } from '../../../../../libs/shopping/src';
import { filterAdapter } from './filter.adapter';

export const injectFilterStore = adaptInjectable(['filters', filters], filterAdapter);
