import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardsComponent } from './dashboards/dashboards.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardsFeatureModule } from './dashboards-feature.module';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardsComponent,
  },
  {
    path: ':dashboardId',
    component: DashboardComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), DashboardsFeatureModule],
  exports: [RouterModule],
})
export class DashboardsFeatureRoutingModule {}
