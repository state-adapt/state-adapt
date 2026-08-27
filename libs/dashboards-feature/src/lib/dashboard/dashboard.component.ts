import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sa-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
