export type CrewFilter = 'all' | 'active' | 'available' | 'selected';
export type CrewSort = 'name' | 'clearance' | 'missionsCompleted';
export type CrewViewSelector = `${CrewFilter}By${Capitalize<CrewSort>}`;

export const crewFilters: CrewFilter[] = ['all', 'active', 'available', 'selected'];
