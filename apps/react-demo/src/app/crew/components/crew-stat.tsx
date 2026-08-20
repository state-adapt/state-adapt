import React from 'react';

export function CrewStat({
  label,
  value,
  testId,
}: {
  label: string;
  value: number;
  testId: string;
}) {
  return (
    <div>
      <strong data-testid={testId}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
