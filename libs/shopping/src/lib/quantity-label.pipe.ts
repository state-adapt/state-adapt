import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'qtyLabel',
})
export class QuantityLabelPipe implements PipeTransform {
  transform(priceStr: string): string {
    return `Qty. at ${priceStr} ea.`;
  }
}
