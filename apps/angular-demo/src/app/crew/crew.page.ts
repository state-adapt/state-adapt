import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

import { CrewDetailComponent } from './components/crew-detail';
import { CrewRosterComponent } from './components/crew-roster';

@Component({
  selector: 'sa-crew-page',
  imports: [CrewDetailComponent, CrewRosterComponent],
  template: `
    @if (callSign(); as sign) {
      <sa-crew-detail [callSign]="sign" />
    } @else {
      <sa-crew-roster />
    }
  `,
})
export class CrewPageComponent {
  private route = inject(ActivatedRoute);
  callSign = toSignal(this.route.paramMap.pipe(map(params => params.get('callSign'))), {
    initialValue: this.route.snapshot.paramMap.get('callSign'),
  });
}
