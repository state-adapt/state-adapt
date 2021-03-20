import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncrementComponent } from './increment.component';

@NgModule({
  imports: [CommonModule],
  declarations: [IncrementComponent],
  exports: [IncrementComponent],
})
export class DemoUiModule {}
