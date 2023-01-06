import { inject } from '@angular/core';
import { Adapt } from '@state-adapt/rxjs';

export const adapt: Adapt['init'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(Adapt);
  return (adaptDep.init as any)(...args);
};
