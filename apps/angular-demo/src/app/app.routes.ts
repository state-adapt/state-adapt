import { Routes } from '@angular/router';

import { CartPageComponent } from './cart';
import { CounterPageComponent } from './counter';
import { CrewPageComponent } from './crew';
import { HomePageComponent } from './home';
import { LivePageComponent } from './live';
import { NotFoundPageComponent } from './not-found.page';
import { TodosPageComponent } from './todos';

export const appRoutes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'counter', component: CounterPageComponent },
  { path: 'todos', component: TodosPageComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'crew', component: CrewPageComponent },
  { path: 'crew/:callSign', component: CrewPageComponent },
  { path: 'live', component: LivePageComponent },
  { path: '**', component: NotFoundPageComponent },
];
