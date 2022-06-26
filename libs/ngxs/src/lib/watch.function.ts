import { inject } from '@angular/core';
import { AdaptCommon } from '@state-adapt/core';
import { Adapt } from './adapt.service';

export const watch: AdaptCommon['watch'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(Adapt); // Needs it from NgRx store
  return (adaptDep.watch as any)(...args);
};
