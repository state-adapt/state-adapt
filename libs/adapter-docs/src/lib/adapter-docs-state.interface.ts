import { AdapterDocs, defaultAdapterDocs } from './adapter-docs.interface';

export const INITIAL_STATE = 'INITIAL_STATE';

export interface HistoryItem {
  inputs: {
    state: any;
    payload: string;
    initialState: any;
    stateChangeName: string;
  };
  state: any;
  selected: boolean;
}

export interface AdapterDocsState {
  docs: AdapterDocs;
  selectedStateChange: string;
  payloadEditorRefreshRequired: boolean;
  selectedSelector: string;
  payload: string;
  demoHistory: HistoryItem[];
  demoState: any;
}

export const initialState: AdapterDocsState = {
  docs: defaultAdapterDocs,
  selectedStateChange: '',
  payloadEditorRefreshRequired: true,
  selectedSelector: '',
  payload: '',
  demoHistory: [],
  demoState: INITIAL_STATE,
};
