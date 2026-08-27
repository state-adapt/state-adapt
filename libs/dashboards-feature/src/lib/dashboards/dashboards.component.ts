import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sa-dashboards',
  standalone: false,
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardsComponent {}
