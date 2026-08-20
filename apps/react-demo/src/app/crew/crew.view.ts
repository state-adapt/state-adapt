import { CrewStatus } from './crew.adapter';

export const crewStatusLabels: Record<CrewStatus, string> = {
  active: 'Active',
  training: 'Training',
  leave: 'On leave',
};

export const capitalize = <Value extends string>(value: Value): Capitalize<Value> =>
  `${value[0].toUpperCase()}${value.slice(1)}` as Capitalize<Value>;

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('');
