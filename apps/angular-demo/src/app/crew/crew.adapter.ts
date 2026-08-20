import { createAdapter } from '@state-adapt/core';
import {
  createEntityAdapter,
  createEntityState,
  EntityState,
} from '@state-adapt/core/adapters';

export type CrewStatus = 'active' | 'training' | 'leave';

export interface CrewMember {
  callSign: string;
  name: string;
  role: string;
  status: CrewStatus;
  clearance: number;
  missionsCompleted: number;
  selected: boolean;
}

export type CrewState = EntityState<CrewMember, 'callSign'>;

export const seededCrew: CrewMember[] = [
  {
    callSign: 'nova-7',
    name: 'Mara Velez',
    role: 'Flight director',
    status: 'active',
    clearance: 5,
    missionsCompleted: 42,
    selected: false,
  },
  {
    callSign: 'atlas-2',
    name: 'Eli Okafor',
    role: 'Orbital pilot',
    status: 'active',
    clearance: 4,
    missionsCompleted: 31,
    selected: true,
  },
  {
    callSign: 'lumen-4',
    name: 'Jun Park',
    role: 'Systems engineer',
    status: 'training',
    clearance: 2,
    missionsCompleted: 12,
    selected: false,
  },
  {
    callSign: 'echo-9',
    name: 'Iris Bell',
    role: 'Mission specialist',
    status: 'active',
    clearance: 3,
    missionsCompleted: 27,
    selected: true,
  },
  {
    callSign: 'drift-3',
    name: 'Noah Chen',
    role: 'Payload scientist',
    status: 'leave',
    clearance: 3,
    missionsCompleted: 18,
    selected: false,
  },
];

/** Logic for one crew member. The entity adapter lifts these operations to one,
 * many, all, and each configured filter. */
export const crewMemberAdapter = createAdapter<CrewMember>()({
  toggleSelected: member => ({ ...member, selected: !member.selected }),
  setSelected: (member, selected: boolean) => ({ ...member, selected }),
  award: (member, levels: number) => ({
    ...member,
    clearance: Math.min(5, member.clearance + levels),
  }),
  setStatus: (member, status: CrewStatus) => ({ ...member, status }),
  logMission: member => ({
    ...member,
    missionsCompleted: member.missionsCompleted + 1,
  }),
  selectors: {
    id: member => member.callSign,
    name: member => member.name,
    clearance: member => member.clearance,
    missionsCompleted: member => member.missionsCompleted,
    selected: member => member.selected,
    active: member => member.status === 'active',
    available: member => member.status === 'active' && member.clearance >= 3,
  },
});

export const crewAdapter = createEntityAdapter<CrewMember, 'callSign'>()(
  crewMemberAdapter,
  {
    filters: ['active', 'available', 'selected'],
    sorters: ['name', 'clearance', 'missionsCompleted'],
    useCache: true,
  },
);

export const initialCrewState: CrewState = crewAdapter.setAll(
  createEntityState<CrewMember, 'callSign'>(),
  seededCrew,
);

let recruitNumber = 0;

export const createRecruit = (name: string): CrewMember => ({
  callSign: `rook-${++recruitNumber}`,
  name: name.trim(),
  role: 'Mission candidate',
  status: 'training',
  clearance: 1,
  missionsCompleted: 0,
  selected: false,
});
