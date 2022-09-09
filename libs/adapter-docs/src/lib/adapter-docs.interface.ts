import { Adapter, createAdapter } from '@state-adapt/angular';

export interface AdapterCreatorParam {
  text: string;
  description?: string;
}

export interface DemoAdapter {
  value: Adapter<any, any, any>;
  stateChanges: {
    [index: string]: { demoPayload: string; documentation: string };
  };
  selectors: { [index: string]: { documentation: string } };
  sourceCode: string;
  initialState: any;
}

export interface AdapterDocs {
  name: string;
  description: string;
  sourceCode: string;
  parameters: AdapterCreatorParam[];
  demoAdapter: DemoAdapter;
}

export const defaultAdapterDocs: AdapterDocs = {
  name: 'Adapter Name',
  description: 'Adapter Description',
  sourceCode: `sourceCode`,
  parameters: [
    {
      text: 'text',
      description: 'description',
    },
  ],
  demoAdapter: {
    value: createAdapter<any>()({}),
    stateChanges: {},
    selectors: {},
    sourceCode: 'export const demoAdapter = {};',
    initialState: null,
  },
};
