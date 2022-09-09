import { inject } from '@angular/core';
import { AdaptCommon } from '@state-adapt/angular';
import { Adapt } from './adapt.service';

export const adapt: AdaptCommon['init'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(Adapt); // Needs it from NgRx store
  return (adaptDep.init as any)(...args);
};
