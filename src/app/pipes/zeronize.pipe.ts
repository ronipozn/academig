import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'zeronize'
})
export class ZeronizePipe implements PipeTransform {
  transform(value: any) {
    if (value) {
      return value;
    }
    return 0;
  }
}

// To capitalize each word do:
// value.replace(/\b\w/g, symbol => symbol.toLocaleUpperCase())
