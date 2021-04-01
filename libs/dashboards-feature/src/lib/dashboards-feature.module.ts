import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardsComponent } from './dashboards/dashboards.component';

@NgModule({
  imports: [RouterModule, CommonModule],
  declarations: [DashboardsComponent, DashboardComponent],
})
export class DashboardsFeatureModule {}
