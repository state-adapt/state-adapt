import { AdapterDocs } from '@state-adapt/adapter-docs';
import entityAdapterCode from '!!raw-loader!./entity-adapter-demo';
import { entityAdapter, initialState } from './entity-adapter-demo';

const initialStateStr = JSON.stringify(initialState, null, 2);
const oneEntityStr = `{
  "id": "1",
  "name": "Jimmy",
  "selected": false
}`;
const manyEntitiesStr = `[
  {
      "id": "1",
      "name": "Jimmy",
      "selected": false
  },
  {
      "id": "2",
      "name": "Sally",
      "selected": false
  }
]`;

const filterExplanation = `Uses the optionAdapter.selectors.selected selector to determine which entities are selected. Made available by passing 'selected' to the filters array in createEntityAdapter's options parameter.`;
const sorterExplanation = `Uses the optionAdapter.selectors.name selector to sort. Made available by passing 'name' to the sorters array in createEntityAdapter's options parameter.`;

export const entityAdapterDocs: AdapterDocs = {
  name: 'createEntityAdapter',
  description: 'Adapter for a list of entities',
  sourceCode:
    '// https://github.com/state-adapt/state-adapt/tree/main/libs/core/adapters/src/lib',
  parameters: [],
  demoAdapter: {
    value: entityAdapter,
    stateChanges: {
      set: {
        demoPayload: initialStateStr,
        documentation: 'Sets state to value passed in payload.',
      },
      reset: {
        demoPayload: 'null',
        documentation: 'Resets state to initial state.',
      },
      addOne: {
        demoPayload: oneEntityStr,
        documentation: 'Adds one entity to state.',
      },
      addMany: {
        demoPayload: manyEntitiesStr,
        documentation: 'Adds many entities to state.',
      },
      setOne: {
        demoPayload: oneEntityStr,
        documentation: 'Sets one entity in state.',
      },
      setMany: {
        demoPayload: manyEntitiesStr,
        documentation: 'Sets many entities in state.',
      },
      setAll: {
        demoPayload: manyEntitiesStr,
        documentation: 'Sets all entities in state.',
      },
      removeOne: {
        demoPayload: `"1"`,
        documentation: 'Removes one entity from state.',
      },
      removeMany: {
        demoPayload: `["1", "2"]`,
        documentation: 'Removes many entities from state.',
      },
      removeAll: {
        demoPayload: 'null',
        documentation: 'Removes all entities from state.',
      },
      upsertOne: {
        demoPayload: oneEntityStr,
        documentation: 'Upserts one entity in state.',
      },
      upsertMany: {
        demoPayload: manyEntitiesStr,
        documentation: 'Upserts many entities in state.',
      },
      updateOne: {
        demoPayload: `["1", { "name": "Johnny" }]`,
        documentation: `Extended update state change from optionAdapter. The payload is an array with the id of the entity to update in the 1st element and the value to pass into optionAdapter's update function in the 2nd element.`,
      },
      updateMany: {
        demoPayload: `[
          ["1", { "name": "Johnny" }],
          ["2", { "name": "Sally" }]
        ]`,
        documentation: `Extended update state change from optionAdapter. The payload is an array of arrays with the id of the entity to update in the 1st element and the value to pass into optionAdapter's update function in the 2nd element.`,
      },
      updateAll: {
        demoPayload: `{"name": "Johnny"}`,
        documentation: `Extended update state change from optionAdapter. The payload is the value to pass into optionAdapter's update function for each entity.`,
      },
      updateSelected: {
        demoPayload: `{"name": "Johnny"}`,
        documentation: `Extended update state change from optionAdapter. The payload is the value to pass into optionAdapter's update function for each selected entity. ${filterExplanation}`,
      },
      resetOne: {
        demoPayload: `"1"`,
        documentation: `Extended reset state change from optionAdapter. The payload is the id of the entity to reset.`,
      },
      resetMany: {
        demoPayload: `["1", "2"]`,
        documentation: `Extended reset state change from optionAdapter. The payload is an array of ids of the entities to reset.`,
      },
      resetAll: {
        demoPayload: 'null',
        documentation: `Extended reset state change from optionAdapter. Resets all entities in state.`,
      },
      resetSelected: {
        demoPayload: 'null',
        documentation: `Extended reset state change from optionAdapter. Resets all selected entities in state. ${filterExplanation}`,
      },
      setOneName: {
        demoPayload: `["1", "Johnny"]`,
        documentation: `Extended setName state change from optionAdapter. The payload is an array with the id of the entity to setName in the 1st element and the value to pass into optionAdapter's setName function in the 2nd element.`,
      },
      setManyName: {
        demoPayload: `[
          ["1", "Johnny"],
          ["2", "Sally"]
        ]`,
        documentation: `Extended setName state change from optionAdapter. The payload is an array of arrays with the id of the entity to setName in the 1st element and the value to pass into optionAdapter's setName function in the 2nd element.`,
      },
      setAllName: {
        demoPayload: `"Johnny"`,
        documentation: `Extended setName state change from optionAdapter. The payload is the value to pass into optionAdapter's setName function for each entity.`,
      },
      setSelectedName: {
        demoPayload: `"Johnny"`,
        documentation: `Extended setName state change from optionAdapter. The payload is the value to pass into optionAdapter's setName function for each selected entity. ${filterExplanation}`,
      },
      resetOneName: {
        demoPayload: `"1"`,
        documentation: `Extended resetName state change from optionAdapter. The payload is the id of the entity to resetName.`,
      },
      resetManyName: {
        demoPayload: `["1", "2"]`,
        documentation: `Extended resetName state change from optionAdapter. The payload is an array of ids of the entities to resetName.`,
      },
      resetAllName: {
        demoPayload: 'null',
        documentation: `Extended resetName state change from optionAdapter. Resets all entities' names in state.`,
      },
      resetSelectedName: {
        demoPayload: 'null',
        documentation: `Extended resetName state change from optionAdapter. Resets all selected entities' names in state. ${filterExplanation}`,
      },
      setOneSelected: {
        demoPayload: `["1", true]`,
        documentation: `Extended setSelected state change from optionAdapter. The payload is an array with the id of the entity to setSelected in the 1st element and the value to pass into optionAdapter's setSelected function in the 2nd element.`,
      },
      setManySelected: {
        demoPayload: `[
          ["1", true],
          ["2", false]
        ]`,
        documentation: `Extended setSelected state change from optionAdapter. The payload is an array of arrays with the id of the entity to setSelected in the 1st element and the value to pass into optionAdapter's setSelected function in the 2nd element.`,
      },
      setAllSelected: {
        demoPayload: `true`,
        documentation: `Extended setSelected state change from optionAdapter. The payload is the value to pass into optionAdapter's setSelected function for each entity.`,
      },
      setSelectedSelected: {
        demoPayload: `false`,
        documentation: `Extended setSelected state change from optionAdapter. The payload is the value to pass into optionAdapter's setSelected function for each selected entity. ${filterExplanation}`,
      },
      resetOneSelected: {
        demoPayload: `"1"`,
        documentation: `Extended resetSelected state change from optionAdapter. The payload is the id of the entity to resetSelected.`,
      },
      resetManySelected: {
        demoPayload: `["1", "2"]`,
        documentation: `Extended resetSelected state change from optionAdapter. The payload is an array of ids of the entities to resetSelected.`,
      },
      resetAllSelected: {
        demoPayload: 'null',
        documentation: `Extended resetSelected state change from optionAdapter. Resets all entities' \`selected\` property.`,
      },
      resetSelectedSelected: {
        demoPayload: 'null',
        documentation: `Extended resetSelected state change from optionAdapter. Resets all selected entities' \`selected\` property. ${filterExplanation}`,
      },
      setOneSelectedTrue: {
        demoPayload: `"1"`,
        documentation: `Extended setSelectedTrue state change from optionAdapter. The payload is the id of the entity to setSelectedTrue.`,
      },
      setManySelectedTrue: {
        demoPayload: `["1", "2"]`,
        documentation: `Extended setSelectedTrue state change from optionAdapter. The payload is an array of ids of the entities to setSelectedTrue.`,
      },
      setAllSelectedTrue: {
        demoPayload: 'null',
        documentation: `Extended setSelectedTrue state change from optionAdapter. Sets all entities' \`selected\` property to true.`,
      },
      setSelectedSelectedTrue: {
        demoPayload: 'null',
        documentation: `Extended setSelectedTrue state change from optionAdapter. Sets all selected entities' \`selected\` property to true. ${filterExplanation}`,
      },
      setOneSelectedFalse: {
        demoPayload: `"1"`,
        documentation: `Extended setSelectedFalse state change from optionAdapter. The payload is the id of the entity to setSelectedFalse.`,
      },
      setManySelectedFalse: {
        demoPayload: `["1", "2"]`,
        documentation: `Extended setSelectedFalse state change from optionAdapter. The payload is an array of ids of the entities to setSelectedFalse.`,
      },
      setAllSelectedFalse: {
        demoPayload: 'null',
        documentation: `Extended setSelectedFalse state change from optionAdapter. Sets all entities' \`selected\` property to false.`,
      },
      setSelectedSelectedFalse: {
        demoPayload: 'null',
        documentation: `Extended setSelectedFalse state change from optionAdapter. Sets all selected entities' \`selected\` property to false. ${filterExplanation}`,
      },
      toggleOneSelected: {
        demoPayload: `"1"`,
        documentation: `Extended toggleSelected state change from optionAdapter. The payload is the id of the entity to toggleSelected.`,
      },
      toggleManySelected: {
        demoPayload: `["1", "2"]`,
        documentation: `Extended toggleSelected state change from optionAdapter. The payload is an array of ids of the entities to toggleSelected.`,
      },
      toggleAllSelected: {
        demoPayload: 'null',
        documentation: `Extended toggleSelected state change from optionAdapter. Toggles all entities' \`selected\` property.`,
      },
      toggleSelectedSelected: {
        demoPayload: 'null',
        documentation: `Extended toggleSelected state change from optionAdapter. Toggles all selected entities' \`selected\` property. ${filterExplanation}`,
      },
    },
    selectors: {
      entities: {
        documentation: `Returns the entities object from state.`,
      },
      ids: {
        documentation: `Returns the ids array from state.`,
      },
      all: {
        documentation: `Returns an array of all entities from state.`,
      },
      count: {
        documentation: `Returns the number of entities in state.`,
      },
      selected: {
        documentation: `Returns an array of all selected entities from state. ${filterExplanation}`,
      },
      selectedCount: {
        documentation: `Returns the number of selected entities in state. ${filterExplanation}`,
      },
      allAreSelected: {
        documentation: `Returns true if all entities are selected. ${filterExplanation}`,
      },
      selectedByName: {
        documentation: `Returns an array of all selected entities from state. ${filterExplanation} ${sorterExplanation}`,
      },
      allByName: {
        documentation: `Returns an array of all entities from state. Sorts by name. ${sorterExplanation}`,
      },
      // 'state', 'entities', 'ids', 'all', 'count', 'selected', 'selectedCount', 'allAreSelected', 'selectedByName', 'allByName'
    },
    initialState,
    sourceCode: entityAdapterCode,
  },
};
