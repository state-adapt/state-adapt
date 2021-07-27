import { createBasicAdapter } from '@state-adapt/core';

interface DemoState {
  prop1: string;
  prop2: string;
}

export const basicAdapter = createBasicAdapter<DemoState>();
