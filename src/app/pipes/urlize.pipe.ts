import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'urlize'
})
export class URLizePipe implements PipeTransform {
  transform(value: any) {
    if (value) {
      return value.replace(/ /g,"_").toLowerCase();
    }
    return '';
  }
}
