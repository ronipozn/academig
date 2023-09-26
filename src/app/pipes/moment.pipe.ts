import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'momentPipe'
})
export class MomentPipe implements PipeTransform {
  transform(value: Date | moment.Moment, ...args: any[]): any {
      const [format] = args;
      if (args[1] == 1) {
        // return moment(value).fromNow();
        return moment(value).calendar(null, {
            sameDay: '[Today], HH:mm',
            lastDay: '[Yesterday]',
            lastWeek: '[Last] dddd',
            sameElse: 'DD/MM/YYYY'
        });
      } else if (args[1] == 2) {
        // return moment(value).fromNow();
        return moment(value).calendar(null, {
            sameDay: 'HH:mm',
            sameElse: 'DD/MM/YYYY, HH:mm'
        });
      } else {
        return moment(value).calendar();
      };
  }
}
