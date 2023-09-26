import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'acronym'
})
export class AcronymPipe implements PipeTransform {
  transform(value: any) {
    if (value) {
      const matches = value.match(/\b(\w)/g);
      const acronym = matches.join('').substring(0, 2).toUpperCase();
      return acronym;
    }
    return '';
  }
}

// To capitalize each word do:
// value.replace(/\b\w/g, symbol => symbol.toLocaleUpperCase())
