import { createAdapter } from '@state-adapt/angular';

interface DemoState {
  prop1: string;
  prop2: string;
}

export const adapter = createAdapter<DemoState>()();
