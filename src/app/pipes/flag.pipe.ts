import { Pipe, PipeTransform } from '@angular/core';
import { Countries } from '../shared/services/shared-service';

@Pipe({
  name: 'flag'
})
export class FlagPipe implements PipeTransform {

  countries = Countries;

  transform(value: any, arg: number) {
    if (value) {
      const c = this.countries[this.countries.findIndex(y => y.name == value)];
      return c ? c.code : '-';
    }
    return '-';
  }
}
