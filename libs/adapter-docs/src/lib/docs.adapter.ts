import { createAdapter } from '@state-adapt/core';
import { ListItem, TileSelection } from 'carbon-components-angular';
import { createSelector } from 'reselect';
import {
  AdapterDocsState,
  INITIAL_STATE,
} from './adapter-docs-state.interface';
import { AdapterDocs } from './adapter-docs.interface';
import { DropdownSelectedEvent } from './dropdown-selection-event.interface';
import { toJson } from './get-diff-html.function';

function wrapInTs(code: string) {
  return '```typescript\n' + code + '\n```';
}

function getListItem(selectedName?: string) {
  return (name: string, i: number): ListItem => ({
    content: name,
    selected: selectedName ? name === selectedName : i === 0,
  });
}

function getAdapterStateChangeItems(state: AdapterDocsState): ListItem[] {
  return state.docs.demoAdapter.value
    ? Object.keys(state.docs.demoAdapter.value)
        .filter(prop => prop !== 'selectors')
        .map(getListItem(state.selectedStateChange))
    : [];
}
function getAdapterSelectorItems(state: AdapterDocsState): ListItem[] {
  return ['getState']
    .concat(
      state.docs.demoAdapter.value?.selectors
        ? Object.keys(state.docs.demoAdapter.value.selectors)
        : [],
    )
    .map(getListItem(state.selectedSelector));
}

function getAdapterStateChanges(state: AdapterDocsState) {
  return state.docs.demoAdapter.stateChanges;
}
function getAdapterSelectors(state: AdapterDocsState) {
  return state.docs.demoAdapter.selectors;
}

function getUserSelectedStateChangeName(state: AdapterDocsState) {
  return state.selectedStateChange;
}
function getUserSelectedSelectorName(state: AdapterDocsState) {
  return state.selectedSelector;
}

const getFirstStateChangeName = createSelector(
  getAdapterStateChangeItems,
  stateChangeItems => stateChangeItems[0]?.content,
);
const getFirstSelectorName = createSelector(
  getAdapterSelectorItems,
  selectorItems => selectorItems[0]?.content,
);

const getSelectedStateChangeName = createSelector(
  [getUserSelectedStateChangeName, getFirstStateChangeName],
  (userSelectedStateChangeName, firstStateChangeName) =>
    userSelectedStateChangeName || firstStateChangeName,
);
const getSelectedSelectorName = createSelector(
  [getUserSelectedSelectorName, getFirstSelectorName],
  (userSelectedSelectorName, firstSelectorName) =>
    userSelectedSelectorName || firstSelectorName,
);

const getSelectedStateChange = createSelector(
  [getAdapterStateChanges, getSelectedStateChangeName],
  (stateChanges, stateChangeName) => stateChanges[stateChangeName],
);
const getSelectedSelector = createSelector(
  [getAdapterSelectors, getSelectedSelectorName],
  (selectors, selectorName) =>
    selectors[selectorName] || { documentation: 'Returns state' },
);

function getDemoHistory(state: AdapterDocsState) {
  return state.demoHistory;
}

const getSelectedHistoryItem = createSelector(
  getDemoHistory,
  history => history.find(item => item.selected) || null,
);
const getLastHistoryItem = createSelector(
  getDemoHistory,
  history => history[history.length - 1],
);
const getSelectedOrLastHistoryItem = createSelector(
  [getSelectedHistoryItem, getLastHistoryItem],
  (selected, last) => selected || last,
);

function getDemoState(state: AdapterDocsState) {
  return state.demoState;
}

function getInitialDemoState(state: AdapterDocsState) {
  return state.docs.demoAdapter.initialState;
}

const getDemoStateOrInitial = createSelector(
  getDemoState,
  getInitialDemoState,
  (state, initialState) => (state === INITIAL_STATE ? initialState : state),
);

const getDiffState = createSelector(
  [getSelectedOrLastHistoryItem, getDemoStateOrInitial],
  (item, state) => (!item ? [null, state] : [item.inputs.state, item.state]),
);

const getDiffStateAndSelectorName = createSelector(
  [getDiffState, getSelectedSelectorName],
  (diff, name) => [diff, name] as [any[], string],
);

function getUserPayload(state: AdapterDocsState) {
  return state.payload;
}

const getSelectedHistoryItemPayload = createSelector(
  getSelectedHistoryItem,
  item => item?.inputs.payload,
);

const getPayload = createSelector(
  [getSelectedHistoryItemPayload, getUserPayload, getSelectedStateChange],
  (selectedHistoryItemPayload, userPayload, stateChange) =>
    selectedHistoryItemPayload || userPayload || stateChange?.demoPayload,
);

const getDemoStateAndPayload = createSelector(
  getDemoStateOrInitial,
  getPayload,
  getInitialDemoState,
  getSelectedStateChangeName,
  (state, payload, initialState, stateChangeName) => ({
    state,
    payload,
    initialState,
    stateChangeName,
  }),
);

export const docsAdapter = createAdapter<AdapterDocsState>()({
  receiveDocs: (state, docs: AdapterDocs) => ({ ...state, docs }),
  selectStateChange: (state: AdapterDocsState, stateChangeName: string) => {
    const selectionChanged =
      getSelectedStateChangeName(state) !== stateChangeName;
    return {
      ...state,
      selectedStateChange: stateChangeName,
      payloadEditorRefreshRequired: selectionChanged,
      payload: selectionChanged ? '' : state.payload,
    };
  },
  resetEditorRefresh: state => ({
    ...state,
    payloadEditorRefreshRequired: false,
  }),
  setPayload: (state, payload: string) => ({ ...state, payload }),
  setDemoState: (state, demoState: any) => ({
    ...state,
    demoHistory: [
      ...state.demoHistory,
      {
        inputs: getDemoStateAndPayload(state),
        state: demoState,
        selected: false,
      },
    ],
    demoState,
  }),
  selectHistoryItem: (state, index?: number) => ({
    ...state,
    demoHistory: state.demoHistory.map((item, i) => ({
      ...item,
      selected: i === index,
    })),
  }),
  selectSelector: (state, selectedSelector: string) => ({
    ...state,
    selectedSelector,
  }),
  selectors: {
    getDocs: state => state.docs,
    getCreatorSourceCodeMd: state => wrapInTs(state.docs.sourceCode),
    getDemoSourceCodeMd: state => wrapInTs(state.docs.demoAdapter.sourceCode),
    getParameters: state => state.docs.parameters,
    getAdapterStateChangeItems,
    getSelectedStateChange,
    getPayloadCodeModel: createSelector(getPayload, payload => ({
      language: 'json',
      uri: 'main.json',
      value: payload && toJson(JSON.parse(payload)), // Format
    })),
    getPayloadEditorRefreshRequired: state =>
      state.payloadEditorRefreshRequired,
    getDemoStateAndPayload,
    getDemoHistory,
    getSelectedHistoryItem,
    getDiffStateAndSelectorName,
    getAdapterSelectorItems,
    getSelectedSelector,
  },
});

export const docsUiAdapter = createAdapter<AdapterDocsState>()({
  ...docsAdapter,
  selectStateChange: (state, { item }: DropdownSelectedEvent) =>
    docsAdapter.selectStateChange(state, item.content),
  selectStateChangeFromHistory: (state, selection: TileSelection) => {
    const historyItem = state.demoHistory.find(
      (item, i) => i === +selection.value,
    );
    return docsAdapter.selectStateChange(
      state,
      historyItem?.inputs.stateChangeName || '',
    );
  },
  selectHistoryItem: (state, selection?: TileSelection) =>
    docsAdapter.selectHistoryItem(state, +(selection?.value || '-1')),
  selectSelector: (state, { item }: DropdownSelectedEvent) =>
    docsAdapter.selectSelector(state, item.content),
});
