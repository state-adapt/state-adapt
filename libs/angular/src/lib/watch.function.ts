import { inject } from '@angular/core';
import { Adapt } from '@state-adapt/rxjs';

export const watch: Adapt['watch'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(Adapt);
  return (adaptDep.watch as any)(...args);
};
