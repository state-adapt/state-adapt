import { createSelectorsCache, joinAdapters } from '@state-adapt/core';
import {
  createEntityAdapter,
  createEntityState,
  EntityState,
  IndexableKeys,
} from './create-entity-adapter.function';
import { stringAdapter } from './string.adapter';
import { booleanAdapter } from './boolean.adapter';

// Basic type tests

type Test = {
  id: number;
  name: string;
  zeee: { a: any };
};

type IndexableOfTest = IndexableKeys<Test>;
const i1: 'id' | 'name' = 2 as any as IndexableOfTest;
type A1 = EntityState<Test>;
type A2 = A1['entities'];
// @ts-expect-error Should use 'id', which is number
const a2: string = 4 as keyof A2;
type A3 = A1['ids'];
// @ts-expect-error Should use 'id', which is number
const a3: string[] = [] as A3;

type B1 = EntityState<Test, 'name'>;
type B2 = B1['entities'];
// @ts-expect-error Should use 'name', which is string
const b2: number = 4 as any as keyof B2;
type B3 = B1['ids'];
// @ts-expect-error Should use 'name', which is string
const b3: number[] = [] as B3;

// Full tests

type Id = 'uuid';
interface Person {
  uuid: string;
  name: string;
  married: boolean;
  deceased: boolean;
  selected: boolean;
}

let numberOfRuns = 0;

const personAdapter = joinAdapters<Person, 'uuid'>()({
  name: stringAdapter,
  married: booleanAdapter,
  deceased: booleanAdapter,
  selected: booleanAdapter,
})({
  name: s => {
    numberOfRuns++;
    return s.state.name;
  },
  married: s => {
    numberOfRuns++;
    return s.state.married;
  },
  id: s => s.state.uuid,
})();

type State = EntityState<Person, Id>;

const initialState = createEntityState<Person, Id, State>();

const personEntityAdapter = createEntityAdapter<Person, Id>()(personAdapter, {
  filters: ['married', 'selected'], // 'deceased'
  sorters: ['name', 'married'],
  useCache: true,
});

describe('createEntityAdapter', () => {
  // ========================================================== Selectors ==========================================================
  // - `count`: number; // count
  // - `${filter}Count`: number; // selectedCount
  // - `allAre${Filter}`: boolean; // allAreSelected

  // - `oneBy{Sorter}`: NO
  // - `allBy{Sorter}`: Person[]; // allByAge
  // - `${filter}By{Sorter}`: Person[]; // selectedByAge
  const entities = [
    {
      uuid: '1',
      name: 'John',
      married: true,
      deceased: false,
      selected: false,
    },
    {
      uuid: '2',
      name: 'Jane',
      married: true,
      deceased: false,
      selected: false,
    },
    {
      uuid: '3',
      name: 'Jack',
      married: false,
      deceased: false,
      selected: false,
    },
  ];
  it('should define base selectors', () => {
    const state = personEntityAdapter.setAll(initialState, entities);

    const all = personEntityAdapter.selectors.all(state);
    expect(all).toEqual(entities);

    const count = personEntityAdapter.selectors.count(state);
    expect(count).toEqual(entities.length);

    const checkTypes = () => {
      // @ts-expect-error count should be a number
      count.concat('');
      // @ts-expect-error length should be a number
      all.length.concat('');
      // @ts-expect-error Doesn't exist
      personEntityAdapter.selectors.asdf;
    };
  });

  it('should define filter and sort selectors', () => {
    const state = personEntityAdapter.setAll(initialState, entities);

    const married = personEntityAdapter.selectors.married(state);
    const expectedMarried = [entities[0], entities[1]];
    expect(married).toEqual(expectedMarried);

    const marriedCount = personEntityAdapter.selectors.marriedCount(state);
    expect(marriedCount).toEqual(expectedMarried.length);

    const allAreMarried = personEntityAdapter.selectors.allAreMarried(state);
    expect(allAreMarried).toEqual(false);

    const marriedByName = personEntityAdapter.selectors.marriedByName(state);
    expect(marriedByName).toEqual([entities[1], entities[0]]);

    const allByName = personEntityAdapter.selectors.allByName(state);
    expect(allByName).toEqual([entities[2], entities[1], entities[0]]);

    const checkTypes = () => {
      // @ts-expect-error Should expect Person[] instead of string
      married.concat('');
      // @ts-expect-error marriedCount should be number
      marriedCount.concat('');
      // @ts-expect-error allAreMarried should be boolean
      allAreMarried.concat('');
      // @ts-expect-error marriedByName should be Person[]
      marriedByName.concat('');
      // @ts-expect-error allByName should be Person[]
      allByName.concat('');
    };
  });

  // ========================================================== Reactions ==========================================================
  // - `${state}One${Change}` // setOneSelected(false)
  // - `${state}All${Change}` // setAllSelected(false)
  // - `${state}${Filter}${Change}` // setSelectedSelected(false)

  it('should have base reactions', () => {
    const reactions = Object.keys(personEntityAdapter);
    // prettier-ignore
    expect([
      'addOne', 'addMany',
      'setOne', 'setMany', 'setAll',
      'removeOne', 'removeMany', 'removeAll',
      'updateOne', 'updateMany', 'updateAll',
      'upsertOne', 'upsertMany',
      'resetOne', 'resetMany',
    ].every(reaction => reactions.includes(reaction))).toBe(true);

    const checkTypes = () => {
      // @ts-expect-error Doesn't exist
      personEntityAdapter.asdf;
      // @ts-expect-error Shouldn't exist; initialState has no entities
      personEntityAdapter.resetAll;
    };
  });

  it('should define add reactions', () => {
    // Add: "addOne","addMany"

    const state = personEntityAdapter.setAll(initialState, entities);

    const newEntity = {
      uuid: '4',
      name: 'Jill',
      married: false,
      deceased: false,
      selected: false,
    };
    const addOne = personEntityAdapter.addOne(state, newEntity);
    const addOneCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      addOne.concat('');
      // @ts-expect-error setAll requires state and entities
      personEntityAdapter.setAll();
      // @ts-expect-error setAll requires Person[] entities
      personEntityAdapter.setAll(state, 5);
    };

    const newEntities = [
      {
        uuid: '5',
        name: 'Jill',
        married: false,
        deceased: false,
        selected: false,
      },
      {
        uuid: '6',
        name: 'Jill',
        married: false,
        deceased: false,
        selected: false,
      },
    ];
    const addMany = personEntityAdapter.addMany(addOne, newEntities);

    expect(addMany).toEqual({
      ...state,
      ids: ['1', '2', '3', '4', '5', '6'],
      entities: {
        1: entities[0],
        2: entities[1],
        3: entities[2],
        4: newEntity,
        5: newEntities[0],
        6: newEntities[1],
      },
    });
    const addManyCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      addMany.concat('');
      // @ts-expect-error addMany requires state and entities
      personEntityAdapter.addMany();
      // @ts-expect-error addMany requires Person[] entities
      personEntityAdapter.addMany(state, [5]);
    };
  });

  it('should define set reactions', () => {
    // Set: "setAll","setOne","setMany"

    const state = personEntityAdapter.setAll(initialState, entities);

    const newOne = {
      ...entities[0],
      selected: true,
    };
    const setOne = personEntityAdapter.setOne(state, newOne);
    const setOneCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      setOne.concat('');
      // @ts-expect-error setOne requires state and an entity
      personEntityAdapter.setOne();
      // @ts-expect-error setOne requires a Person entity
      personEntityAdapter.setOne(state, 5);
    };

    const newMany = [
      {
        ...entities[1],
        selected: true,
      },
      {
        ...entities[2],
        selected: true,
      },
    ];
    const setMany = personEntityAdapter.setMany(setOne, newMany);
    const setManyCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      setMany.concat('');
      // @ts-expect-error setMany requires state and entities
      personEntityAdapter.setMany();
      // @ts-expect-error setMany requires Person[] entities
      personEntityAdapter.setMany(state, [5]);
    };

    expect(setMany).toEqual({
      ...state,
      entities: {
        1: newOne,
        2: newMany[0],
        3: newMany[1],
      },
    });
  });

  it('should define remove reactions', () => {
    // Remove: "removeOne","removeMany","removeAll"

    const state = personEntityAdapter.setAll(initialState, entities);

    const removeOne = personEntityAdapter.removeOne(state, '1');
    const removeOneCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      removeOne.concat('');
      // @ts-expect-error removeOne requires state and an ID
      personEntityAdapter.removeOne();
      // @ts-expect-error Entity IDs are strings
      personEntityAdapter.removeOne(state, 5);
    };

    const removeMany = personEntityAdapter.removeMany(removeOne, ['2']);
    const removeManyCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      removeMany.concat('');
      // @ts-expect-error removeMany requires state and IDs
      personEntityAdapter.removeMany();
      // @ts-expect-error Entity IDs are strings
      personEntityAdapter.removeMany(state, [5]);
    };

    const removeAll = personEntityAdapter.removeAll(removeMany);
    const removeAllCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      removeAll.concat('');
      // @ts-expect-error removeAll requires state
      personEntityAdapter.removeAll();
      // @ts-expect-error removeAll accepts no payload
      personEntityAdapter.removeAll(state, [5]);
    };

    expect(removeAll).toEqual({
      ...state,
      ids: [],
      entities: {},
    });
  });

  it('should define upsert reactions', () => {
    // Upsert: "upsertOne","upsertMany"

    const state = personEntityAdapter.setAll(initialState, entities);

    const newEntities = [
      {
        ...entities[0],
        uuid: '4',
      },
      {
        ...entities[1],
        uuid: '5',
      },
    ];
    const updatedEntities = [
      {
        ...entities[0],
        selected: true,
      },
      {
        ...entities[1],
        selected: true,
      },
    ];

    const upsertOne = personEntityAdapter.upsertOne(state, newEntities[0]);
    const upsertOneCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      upsertOne.concat('');
      // @ts-expect-error upsertOne requires state and an entity
      personEntityAdapter.upsertOne();
      // @ts-expect-error upsertOne requires a Person entity
      personEntityAdapter.upsertOne(state, 5);
    };

    const upsertOneMore = personEntityAdapter.upsertOne(upsertOne, updatedEntities[0]);
    const upsertOneMoreCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      upsertOneMore.concat('');
      // @ts-expect-error upsertOne requires state and an entity
      personEntityAdapter.upsertOne();
      // @ts-expect-error upsertOne requires a Person entity
      personEntityAdapter.upsertOne(state, 5);
    };

    const upsertMany = personEntityAdapter.upsertMany(upsertOneMore, [
      newEntities[1],
      updatedEntities[1],
    ]);
    const upsertManyCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      upsertMany.concat('');
      // @ts-expect-error upsertMany requires state and entities
      personEntityAdapter.upsertMany();
      // @ts-expect-error upsertMany requires Person[] entities
      personEntityAdapter.upsertMany(state, [5]);
    };

    expect(upsertMany).toEqual({
      ...state,
      ids: ['1', '2', '3', '4', '5'],
      entities: {
        1: updatedEntities[0],
        2: updatedEntities[1],
        3: entities[2],
        4: newEntities[0],
        5: newEntities[1],
      },
    });
  });

  it('should define update reactions', () => {
    // update: "updateOne","updateMany","updateAll","updateMarried"

    const state = personEntityAdapter.setAll(initialState, entities);

    const updateOne = personEntityAdapter.updateOne(
      state,
      ['1', { selected: true }],
      state,
    );
    const updateOneCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      updateOne.concat('');
      // @ts-expect-error updateOne requires state and an update
      personEntityAdapter.updateOne();
      // @ts-expect-error updateOne requires an ID-update tuple
      personEntityAdapter.updateOne(state, [5]);
    };

    const updateMany = personEntityAdapter.updateMany(
      updateOne,
      [
        ['2', { selected: true }],
        ['3', { selected: true }],
      ],
      state,
    );
    expect(updateMany).toEqual({
      ...state,
      entities: {
        1: {
          ...entities[0],
          selected: true,
        },
        2: {
          ...entities[1],
          selected: true,
        },
        3: {
          ...entities[2],
          selected: true,
        },
      },
    });
    const updateManyCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      updateMany.concat('');
      // @ts-expect-error updateMany requires state and updates
      personEntityAdapter.updateMany();
      // @ts-expect-error updateMany requires ID-update tuples
      personEntityAdapter.updateMany(state, [5]);
    };

    const updateAll = personEntityAdapter.updateAll(
      updateMany,
      { selected: false },
      state,
    );
    expect(updateAll).toEqual(state);
    const updateAllCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      updateAll.concat('');
      // @ts-expect-error updateAll requires state and changes
      personEntityAdapter.updateAll();
      // @ts-expect-error updateAll requires partial Person changes
      personEntityAdapter.updateAll(state, 5);
    };

    const updateMarried = personEntityAdapter.updateMarried(
      updateAll,
      { selected: true },
      state,
    );
    expect(updateMarried).toEqual({
      ...state,
      entities: {
        1: {
          ...entities[0],
          selected: true,
        },
        2: {
          ...entities[1],
          selected: true,
        },
        3: {
          ...entities[2],
          selected: false,
        },
      },
    });
  });
  const updateMarriedCheckTypes = () => {
    // @ts-expect-error Result is entity state, not an array
    updateMarried.concat('');
    // @ts-expect-error updateMarried requires state and changes
    personEntityAdapter.updateMarried();
    // @ts-expect-error updateMarried requires partial Person changes
    personEntityAdapter.updateMarried(state, 5);
  };

  it('should define reactions for entity adapter reactions', () => {
    // ${stateChange}Filter${Name}

    const state = personEntityAdapter.setAll(initialState, entities);

    const setOneName = personEntityAdapter.setOneName(state, ['1', 'Johnny'], state);
    expect(setOneName).toEqual({
      ...state,
      entities: {
        1: {
          ...entities[0],
          name: 'Johnny',
        },
        2: entities[1],
        3: entities[2],
      },
    });
    const setOneNameCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      setOneName.concat('');
      // @ts-expect-error setOneName requires state and an ID-value tuple
      personEntityAdapter.setOneName();
      // @ts-expect-error setOneName requires a string ID and name
      personEntityAdapter.setOneName(state, [5]);
    };

    const setManyName = personEntityAdapter.setManyName(
      state,
      [
        ['1', 'Johnny'],
        ['2', 'Johnny'],
      ],
      state,
    );
    expect(setManyName).toEqual({
      ...state,
      entities: {
        1: {
          ...entities[0],
          name: 'Johnny',
        },
        2: {
          ...entities[1],
          name: 'Johnny',
        },
        3: entities[2],
      },
    });
    const setManyNameCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      setManyName.concat('');
      // @ts-expect-error setManyName requires state and ID-value tuples
      personEntityAdapter.setManyName();
      // @ts-expect-error setManyName requires string IDs and names
      personEntityAdapter.setManyName(state, [5]);
    };

    const setAllName = personEntityAdapter.setAllName(state, 'Johnny', state);
    expect(setAllName).toEqual({
      ...state,
      entities: {
        1: {
          ...entities[0],
          name: 'Johnny',
        },
        2: {
          ...entities[1],
          name: 'Johnny',
        },
        3: {
          ...entities[2],
          name: 'Johnny',
        },
      },
    });
    const setAllNameCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      setAllName.concat('');
      // @ts-expect-error setAllName requires state and a name
      personEntityAdapter.setAllName();
      // @ts-expect-error Names must be strings
      personEntityAdapter.setAllName(state, 5);
    };

    const concatMarriedName = personEntityAdapter.concatMarriedName(
      state,
      ' Smith',
      state,
    );
    expect(concatMarriedName).toEqual({
      ...state,
      entities: {
        1: {
          ...entities[0],
          name: `${entities[0].name} Smith`,
        },
        2: {
          ...entities[1],
          name: `${entities[1].name} Smith`,
        },
        3: entities[2],
      },
    });
    const concatMarriedNameCheckTypes = () => {
      // @ts-expect-error Result is entity state, not an array
      concatMarriedName.concat('');
      // @ts-expect-error concatMarriedName requires state and text
      personEntityAdapter.concatMarriedName();
      // @ts-expect-error Text to concatenate must be a string
      personEntityAdapter.concatMarriedName(state, 5);
    };
  });

  // ========================================================== Reactions and selectors together ==========================================================
  it('should correctly apply some state changes and select from them', () => {
    // TypeScript will be its own beast
    // Selectors cache needs to be figured out
    // I should probably test the cache itself?

    // Writing the adapter docs will also help document everything. I should go through each one at the same time I write the test case
    const state = personEntityAdapter.setAll(initialState, entities);

    const selected = personEntityAdapter.setAllSelected(state, true, state);
    const selectedCount = personEntityAdapter.selectors.selectedCount(selected);
    expect(selectedCount).toEqual(entities.length);

    const allAreSelected = personEntityAdapter.selectors.allAreSelected(selected);
    expect(allAreSelected).toEqual(true);

    const combinedCheckTypes = () => {
      // @ts-expect-error Selected result is entity state, not an array
      selected.concat('');
      // @ts-expect-error selectedCount is a number
      selectedCount.concat('');
      // @ts-expect-error allAreSelected is a boolean
      allAreSelected.concat('');
    };
  });

  // ========================================================== Selector Cache ==========================================================

  it('should manage selector cache correctly', () => {
    numberOfRuns = 0;
    const cache = createSelectorsCache();
    cache.__children.entity_80 = createSelectorsCache();
    const state = (personEntityAdapter.setAll as any)(
      initialState,
      entities,
      initialState,
      cache,
    );
    // Doesn't create entity caches eagerly, and resets after setAll
    expect(cache.__children).toEqual(createSelectorsCache().__children);

    //
    const allByName = personEntityAdapter.selectors.allByName(state);
    expect(numberOfRuns).toBeGreaterThan(3);

    numberOfRuns = 0;
    const allByNameCached = (personEntityAdapter.selectors.allByName as any)(
      state,
      cache,
    );
    expect(numberOfRuns).toEqual(3);

    expect(allByName).toEqual(allByNameCached);
    expect(cache.__children).not.toEqual(createSelectorsCache().__children);

    numberOfRuns = 0;
    const allAreMarried = personEntityAdapter.selectors.allAreMarried(state);
    const allAreMarried2 = personEntityAdapter.selectors.allAreMarried(state);
    expect(numberOfRuns).toBeGreaterThan(3);

    numberOfRuns = 0;
    const allAreMarriedCached = (personEntityAdapter.selectors.allAreMarried as any)(
      state,
      cache,
    );
    expect(numberOfRuns).toEqual(3);

    expect(allAreMarried).toEqual(allAreMarriedCached);

    // Resets after resetAll
    const state2 = (personEntityAdapter.removeAll as any)(state, entities, state, cache);
    expect(cache.__children).toEqual(createSelectorsCache().__children);
  });
});
