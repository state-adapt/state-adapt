import React from 'react';
import { useParams } from 'react-router-dom';

import { CrewDetail } from './components/crew-detail';
import { CrewRoster } from './components/crew-roster';

export function CrewPage() {
  const { callSign } = useParams();

  return callSign ? <CrewDetail callSign={callSign} /> : <CrewRoster />;
}
