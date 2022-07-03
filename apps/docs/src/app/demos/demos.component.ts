import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TilesModule } from 'carbon-components-angular/tiles';
import { ContentComponent } from '../content.component';

interface Demo {
  title: string;
  href: string;
  img: string;
  features: string[];
}

@Component({
  standalone: true,
  selector: 'state-adapt-demos',
  imports: [CommonModule, ContentComponent, TilesModule],
  template: `
    <state-adapt-content>
      <h1>Demos</h1>
      <div class="demo-tiles-container">
        <ibm-clickable-tile *ngFor="let demo of demos" [href]="demo.href" target="_blank">
          <div>
            <h3>{{ demo.title }}</h3>
            <ol>
              <li *ngFor="let feature of demo.features">{{ feature }}</li>
            </ol>
          </div>
          <img [src]="demo.img" />
        </ibm-clickable-tile>
      </div>
    </state-adapt-content>
  `,
  styles: [
    `
      .demo-tiles-container {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        padding-top: 20px;
      }
      .demo-tiles-container ibm-clickable-tile {
        width: calc(50% - 10px);
      }
      ::ng-deep .demo-tiles-container ibm-clickable-tile a {
        height: 400px;
        padding: 0 1em 1em;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
      }
      .demo-tiles-container ibm-clickable-tile img {
        width: 100%;
        max-height: 60%;
      }
      .demo-tiles-container ibm-clickable-tile h3 {
        margin-top: 0em;
      }
      .demo-tiles-container ibm-clickable-tile ol {
        margin-top: 0.4em;
      }
    `,
  ],
})
export class DemosComponent {
  demos: Demo[] = [
    {
      title: 'Angular Reactive Forms with NgRx',
      href: 'https://stackblitz.com/edit/angular-reactive-forms-state-management?file=src%2Fapp%2Fform%2Fstate-adapt-form.component.ts',
      img: '../../assets/ngrx-forms-screenshot.png',
      features: ['NgRx', 'Angular Reactive Forms'],
    },
    {
      title: 'Shopping Cart',
      href: 'https://stackblitz.com/github/state-adapt/state-adapt/tree/stackblitz-ng-sa-shopping?file=apps%2Fng-sa-shopping%2Fsrc%2Fapp%2Fapp.component.ts',
      img: '../../assets/shopping-screenshot.png',
      features: [
        '2 state adapters',
        '3 mini-stores, 2 using the same adapter',
        '1 use of `joinSelectors` (for joining stores)',
      ],
    },
  ];
}
