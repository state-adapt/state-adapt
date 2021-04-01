import { Component } from '@angular/core';
import md from 'raw-loader!./intro.md';

@Component({
  selector: 'state-adapt-intro',
  templateUrl: `./intro.component.html`,
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent {
  secondary = false;
  md = md;
}
