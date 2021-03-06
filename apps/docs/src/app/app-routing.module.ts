import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConceptsOverviewComponent } from './concepts/overview.component';
import { SourcesComponent } from './concepts/sources.component';
import { AdaptersComponent } from './concepts/adapters.component';
import { DemosComponent } from './demos/demos.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { IntroComponent } from './intro/intro.component';
import { StoresComponent } from './concepts/stores.component';
import { ThinkingReactivelyComponent } from './concepts/thinking-reactively.component';
import { AdaptersCoreComponent } from './adapters/adapters-core.component';

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
      {
        path: 'adapters',
        component: AdaptersComponent,
      },
      {
        path: 'stores',
        component: StoresComponent,
      },
      {
        path: 'thinking-reactively',
        component: ThinkingReactivelyComponent,
      },
    ],
  },
  {
    path: 'adapters/:adapterName',
    component: AdaptersCoreComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 50],
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
