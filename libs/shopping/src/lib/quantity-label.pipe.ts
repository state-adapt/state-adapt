import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'qtyLabel',
  standalone: false,
})
export class QuantityLabelPipe implements PipeTransform {
  transform(priceStr: string | null): string {
    return `Qty. at ${priceStr} ea.`;
  }
}
