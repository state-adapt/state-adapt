import { Component, OnInit } from '@angular/core';
import { SideMenuStoreService } from './app-store';

@Component({
  selector: 'state-adapt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private sideMenuStoreService: SideMenuStoreService) {}

  title = 'ng-sa-store-services';
  menuOpened$ = this.sideMenuStoreService.state;

  ngOnInit(): void {
    this.sideMenuStoreService.set(true);
  }

  toggleMenu(): void {
    this.sideMenuStoreService.toggle();
  }
}
