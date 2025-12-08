import { InjectionToken } from '@angular/core';
import { configureStateAdapt, StateAdapt } from '@state-adapt/rxjs';

export const StateAdaptToken = new InjectionToken<StateAdapt>('StateAdapt', {
  providedIn: 'root',
  factory: () => configureStateAdapt() as any,
});
