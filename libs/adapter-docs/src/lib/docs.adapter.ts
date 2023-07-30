import { buildAdapter, mapPayloads } from '../../../../libs/core/src';
import { ListItem } from 'carbon-components-angular';
import { TileSelection } from 'carbon-components-angular/tiles';
import { AdapterDocsState, INITIAL_STATE } from './adapter-docs-state.interface';
import { AdapterDocs } from './adapter-docs.interface';
import { DropdownSelectedEvent } from './dropdown-selection-event.interface';
import { toJson } from './get-diff-html.function';

function wrapInTs(code: string) {
  return '<pre class="language-typescript>\n' + code + '\n</pre>';
}

function getListItem(selectedName?: string) {
  return (name: string, i: number): ListItem => ({
    content: name,
    selected: selectedName ? name === selectedName : i === 0,
  });
}

export const docsAdapter = buildAdapter<AdapterDocsState>()({
  selectors: {
    name: s => s.docs.name,
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
    creatorSourceCodeMd: s => s.docs.sourceCode,
    demoSourceCodeMd: s => s.docs.demoAdapter.sourceCode,
    parameters: s => s.docs.parameters,
    payloadEditorRefreshRequired: s => s.payloadEditorRefreshRequired,
  },
})({
  firstStateChangeName: s => s.adapterStateChangeItems[0]?.content,
  firstSelectorName: s => s.adapterSelectorItems[0]?.content,
  selectedHistoryItem: s => s.demoHistory.find(item => item.selected) || null,
  lastHistoryItem: s => s.demoHistory[s.demoHistory.length - 1],
  demoStateOrInitial: s =>
    s.demoState === INITIAL_STATE ? s.initialDemoState : s.demoState,
})({
  selectedStateChangeName: s => s.userSelectedStateChangeName || s.firstStateChangeName,
  selectedSelectorName: s => s.userSelectedSelectorName || s.firstSelectorName,
  selectedOrLastHistoryItem: s => s.selectedHistoryItem || s.lastHistoryItem,
  selectedHistoryItemPayload: s => s.selectedHistoryItem?.inputs.payload,
})({
  selectedStateChange: s => s.adapterStateChanges[s.selectedStateChangeName],
  selectedSelector: s =>
    s.adapterSelectors[s.selectedSelectorName] || {
      documentation: 'Returns state',
    },
  diffState: ({ selectedOrLastHistoryItem: item, demoStateOrInitial: state }) =>
    !item ? [state, state] : [item.inputs.state, item.state],
})({
  diffStateAndSelectorName: s => [s.diffState, s.selectedSelectorName] as [any[], string],
  payload: s =>
    s.selectedHistoryItemPayload || s.userPayload || s.selectedStateChange?.demoPayload,
})({
  demoStateAndPayload: s => ({
    state: s.demoStateOrInitial,
    payload: s.payload,
    initialState: s.initialDemoState,
    stateChangeName: s.selectedStateChangeName,
  }),
  payloadCodeModel: s => ({
    language: 'json',
    uri: s.name + 'main.json',
    value: s.payload && toJson(JSON.parse(s.payload)),
  }),
  // State changes
})(([selectors]) => ({
  receiveDocs: (state, docs: AdapterDocs) => ({
    ...state,
    docs: { ...docs, description: `<p>${docs.description}</p>` },
  }),
  selectStateChange: (state: AdapterDocsState, stateChangeName: string, i, cache) => {
    const selectionChanged =
      selectors.selectedStateChangeName(state, cache) !== stateChangeName;
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
}))(([, reactions]) => ({
  selectStateChangeFromHistory: (state, index: number, ...rest) =>
    reactions.selectStateChange(
      state,
      state.demoHistory.find((item, i) => i === index)?.inputs.stateChangeName || '',
      ...rest,
    ),
}))(([, reactions]) =>
  mapPayloads(
    {
      setDemoStateToNull: reactions.setDemoState,
      selectStateChangeFromDropdown: reactions.selectStateChange,
      selectHistoryItemFromTile: reactions.selectHistoryItem,
      selectSelectorFromDropdown: reactions.selectSelector,
      ...reactions,
    },
    {
      setDemoStateToNull: () => null,
      selectStateChangeFromDropdown: ({ item }: DropdownSelectedEvent) => item.content,
      selectStateChangeFromHistory: (selection: TileSelection) => +selection.value,
      selectHistoryItemFromTile: (selection?: TileSelection) =>
        +(selection?.value || '-1'),
      selectSelectorFromDropdown: ({ item }: DropdownSelectedEvent) => item.content,
    },
  ),
)();
