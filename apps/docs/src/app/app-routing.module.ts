import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConceptsOverviewComponent } from './concepts/overview.component';
import { SourcesComponent } from './concepts/sources.component';
import { DemosComponent } from './demos/demos.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
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
  // {
  //   path: 'dashboards',
  //   loadChildren: () =>
  //     import('@state-adapt/dashboards-feature').then(
  //       m => m.DashboardsFeatureRoutingModule,
  //     ),
  // },
  {
    path: 'getting-started',
    component: GettingStartedComponent,
  },
  {
    path: 'demos',
    component: DemosComponent,
  },
  {
    path: 'dashboards',
    loadChildren: () =>
      import('@state-adapt/dashboards-feature').then(
        m => m.DashboardsFeatureRoutingModule,
      ),
  },
  {
    path: 'concepts',
    children: [
      {
        path: 'overview',
        component: ConceptsOverviewComponent,
      },
      {
        path: 'sources',
        component: SourcesComponent,
      },
    ],
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
