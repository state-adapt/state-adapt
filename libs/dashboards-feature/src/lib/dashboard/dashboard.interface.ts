// /dashboards/889dad44-968b-4e28-baaf-cf062caae157

import { Card } from '../card/card.interface';

interface Dashboard {
  id: string;
  title: string;
  lastModified: string; // '2021-02-25T17:02:06.351Z',
  thumbnail: string;
  cards: Card[];
}
