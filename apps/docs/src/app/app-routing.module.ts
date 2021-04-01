import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntroComponent } from './intro/intro.component';

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
    loadChildren: () =>
      import('@state-adapt/dashboards-feature').then(
        m => m.DashboardsFeatureRoutingModule,
      ),
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
