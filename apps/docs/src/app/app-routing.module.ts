import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntroComponent } from './intro/intro.component';

@Component({
  selector: 'state-adapt-dashboards',
  template: 'Dashboards Demo App coming soon!',
})
class DashboardsComponent {}
@Component({
  selector: 'state-adapt-adapters',
  template: 'Adapters coming soon!',
})
class AdaptersComponent {}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: IntroComponent,
  },
  {
    path: 'dashboards',
    component: DashboardsComponent,
    // loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'adapters/core',
    component: AdaptersComponent,
    // loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
