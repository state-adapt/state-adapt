import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'sa-navigate',
  template: '',
  imports: [RouterModule],
})
export class SaNavigateComponent implements OnChanges {
  @Input() url: string | null = null;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges) {
    const urlChange = changes['url'];
    const newUrl = urlChange?.currentValue;
    if (newUrl) {
      this.router.navigate([newUrl]);
    }
  }
}
