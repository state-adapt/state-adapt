import { createAdapter, createSelectors } from '@state-adapt/core';
import { ListItem, TileSelection } from 'carbon-components-angular';
import { AdapterDocsState, INITIAL_STATE } from './adapter-docs-state.interface';
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

const selectors = createSelectors<AdapterDocsState>()(
  {
    adapterStateChangeItems: s =>
      s.docs.demoAdapter.value
        ? Object.keys(s.docs.demoAdapter.value)
            .filter(prop => prop !== 'selectors')
            .map(getListItem(s.selectedStateChange))
        : [],
    adapterSelectorItems: s =>
      (s.docs.demoAdapter.value?.selectors
        ? Object.keys(s.docs.demoAdapter.value.selectors)
        : []
      ).map(getListItem(s.selectedSelector)),
    adapterStateChanges: s => s.docs.demoAdapter.stateChanges,
    adapterSelectors: s => s.docs.demoAdapter.selectors,
    userSelectedStateChangeName: s => s.selectedStateChange,
    userSelectedSelectorName: s => s.selectedSelector,
    demoHistory: s => s.demoHistory,
    demoState: s => s.demoState,
    initialDemoState: s => s.docs.demoAdapter.initialState,
    userPayload: s => s.payload,
    docs: s => s.docs,
    creatorSourceCodeMd: s => wrapInTs(s.docs.sourceCode),
    demoSourceCodeMd: s => wrapInTs(s.docs.demoAdapter.sourceCode),
    parameters: s => s.docs.parameters,
    payloadEditorRefreshRequired: s => s.payloadEditorRefreshRequired,
  },
  {
    firstStateChangeName: s => s.adapterStateChangeItems[0]?.content,
    firstSelectorName: s => s.adapterSelectorItems[0]?.content,
    selectedHistoryItem: s => s.demoHistory.find(item => item.selected) || null,
    lastHistoryItem: s => s.demoHistory[s.demoHistory.length - 1],
    demoStateOrInitial: s =>
      s.demoState === INITIAL_STATE ? s.initialDemoState : s.demoState,
  },
  {
    selectedStateChangeName: s => s.userSelectedStateChangeName || s.firstStateChangeName,
    selectedSelectorName: s => s.userSelectedSelectorName || s.firstSelectorName,
    selectedOrLastHistoryItem: s => s.selectedHistoryItem || s.lastHistoryItem,
    selectedHistoryItemPayload: s => s.selectedHistoryItem?.inputs.payload,
  },
  {
    selectedStateChange: s => s.adapterStateChanges[s.selectedStateChangeName],
    selectedSelector: s =>
      s.adapterSelectors[s.selectedSelectorName] || {
        documentation: 'Returns state',
      },
    diffState: ({ selectedOrLastHistoryItem: item, demoStateOrInitial: state }) =>
      !item ? [null, state] : [item.inputs.state, item.state],
  },
  {
    diffStateAndSelectorName: s =>
      [s.diffState, s.selectedSelectorName] as [any[], string],
    payload: s =>
      s.selectedHistoryItemPayload || s.userPayload || s.selectedStateChange?.demoPayload,
  },
  {
    demoStateAndPayload: s => ({
      state: s.demoStateOrInitial,
      payload: s.payload,
      initialState: s.initialDemoState,
      stateChangeName: s.selectedStateChangeName,
    }),
    payloadCodeModel: s => ({
      language: 'json',
      uri: 'main.json',
      value: s.payload && toJson(JSON.parse(s.payload)), // Format
    }),
  },
);

export const docsAdapter = createAdapter<AdapterDocsState>()({
  receiveDocs: (state, docs: AdapterDocs) => ({ ...state, docs }),
  selectStateChange: (state: AdapterDocsState, stateChangeName: string) => {
    const selectionChanged = selectors.selectedStateChangeName(state) !== stateChangeName;
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
        inputs: selectors.demoStateAndPayload(state),
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
  selectors,
});

export const docsUiAdapter = createAdapter<AdapterDocsState>()({
  ...docsAdapter,
  selectStateChange: (state, { item }: DropdownSelectedEvent) =>
    docsAdapter.selectStateChange(state, item.content),
  selectStateChangeFromHistory: (state, selection: TileSelection) => {
    const historyItem = state.demoHistory.find((item, i) => i === +selection.value);
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
