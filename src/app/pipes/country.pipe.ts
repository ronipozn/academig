import { Pipe, PipeTransform } from '@angular/core';
import { Countries } from '../shared/services/shared-service';

@Pipe({
  name: 'country'
})
export class CountryPipe implements PipeTransform {

  countries = Countries;

  transform(value: any) {
    if (value) {
      const country = this.countries[this.countries.findIndex(y => y.id == value)];
      return country ? country.name : 'x';
    }
    return '-';
  }
}
