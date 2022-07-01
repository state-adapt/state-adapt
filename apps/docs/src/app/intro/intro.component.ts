import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import md from 'raw-loader!./intro.md';

@Component({
  selector: 'state-adapt-intro',
  templateUrl: `./intro.component.html`,
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent {
  @ViewChild('circuitsContainer', { static: true, read: ViewContainerRef })
  circuitsContainer!: ViewContainerRef;
  secondary = false;
  md = md;

  constructor(public viewContainerRef: ViewContainerRef) {
    import('../circuits/circuits.component').then(m =>
      this.circuitsContainer.createComponent(m.CircuitsComponent),
    );
  }

  MOARRR() {
    (window as any).MOARRR();
  }
}
