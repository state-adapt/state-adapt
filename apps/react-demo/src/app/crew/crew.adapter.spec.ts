import {
  createRecruit,
  crewAdapter,
  CrewState,
  initialCrewState,
  seededCrew,
} from './crew.adapter';

const select = <K extends keyof typeof crewAdapter.selectors>(
  name: K,
  state: CrewState,
) => (crewAdapter.selectors[name] as any)(state);

describe('crewAdapter selectors', () => {
  it('normalizes entities around their call signs', () => {
    expect(initialCrewState.ids).toEqual(seededCrew.map(member => member.callSign));
    expect(initialCrewState.entities['nova-7']).toBe(seededCrew[0]);
    expect(select('count', initialCrewState)).toBe(5);
  });

  it('builds filtered collections and their counts', () => {
    expect(
      select('active', initialCrewState).map((member: any) => member.callSign),
    ).toEqual(['nova-7', 'atlas-2', 'echo-9']);
    expect(select('availableCount', initialCrewState)).toBe(3);
    expect(select('selectedCount', initialCrewState)).toBe(2);
    expect(select('allAreSelected', initialCrewState)).toBe(false);
  });

  it('sorts filtered and complete views without changing entity order', () => {
    expect(
      select('allByClearance', initialCrewState).map((member: any) => member.clearance),
    ).toEqual([2, 3, 3, 4, 5]);
    expect(
      select('selectedByName', initialCrewState).map((member: any) => member.name),
    ).toEqual(['Eli Okafor', 'Iris Bell']);
    expect(initialCrewState.ids).toEqual(seededCrew.map(member => member.callSign));
  });
});

describe('crewAdapter reactions', () => {
  it('lifts a void member reaction to one alternate-id entity', () => {
    const next = crewAdapter.toggleOneSelected(
      initialCrewState,
      'nova-7',
      initialCrewState,
    );

    expect(next.entities['nova-7'].selected).toBe(true);
    expect(next.entities['atlas-2']).toBe(initialCrewState.entities['atlas-2']);
  });

  it('runs reactions over all entities or just a configured filter', () => {
    const selectedAwarded = crewAdapter.awardSelected(
      initialCrewState,
      1,
      initialCrewState,
    );
    expect(selectedAwarded.entities['atlas-2'].clearance).toBe(5);
    expect(selectedAwarded.entities['echo-9'].clearance).toBe(4);
    expect(selectedAwarded.entities['nova-7'].clearance).toBe(5);

    const toggledMany = crewAdapter.toggleManySelected(
      initialCrewState,
      ['nova-7', 'lumen-4'],
      initialCrewState,
    );
    expect(select('selectedCount', toggledMany)).toBe(4);

    const selectedAll = crewAdapter.setAllSelected(
      initialCrewState,
      true,
      initialCrewState,
    );
    expect(select('allAreSelected', selectedAll)).toBe(true);
  });

  it('updates an entity while retaining normalized identity', () => {
    const next = crewAdapter.setOneStatus(
      initialCrewState,
      ['lumen-4', 'active'],
      initialCrewState,
    );

    expect(next.ids).toBe(initialCrewState.ids);
    expect(next.entities['lumen-4'].status).toBe('active');
    expect(select('activeCount', next)).toBe(4);
  });

  it('adds, upserts, and removes records', () => {
    const recruit = createRecruit('  Rowan Vega  ');
    const added = crewAdapter.addOne(initialCrewState, recruit);
    const upserted = crewAdapter.upsertMany(added, [
      { ...recruit, clearance: 2 },
      {
        ...recruit,
        callSign: 'rook-external',
        name: 'External Recruit',
      },
    ]);
    const removed = crewAdapter.removeOne(upserted, recruit.callSign);

    expect(recruit.name).toBe('Rowan Vega');
    expect(upserted.entities[recruit.callSign].clearance).toBe(2);
    expect(upserted.entities['rook-external'].name).toBe('External Recruit');
    expect(removed.entities[recruit.callSign]).toBeUndefined();
    expect(select('count', removed)).toBe(6);
  });
});
