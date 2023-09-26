import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'rankPipe'
})
export class RankPipe implements PipeTransform {
  transform(value: number, ...args: any[]): any {
      const [format] = args;
      if (args[0]==0) {
        switch (value) {
          case (201): return "201-250"
          case (251): return "251-300"
          case (301): return "301-350"
          case (351): return "351-400"
          case (401): return "401-500"
          case (601): return "601-800"
          case (801): return "801-1000"
          case (1001): return "1001+"
          default: return value;
        }
      } else if (args[0]==1) {
        switch (value) {
          case (101): return "101-150"
          case (151): return "151-200"
          case (201): return "201-300"
          case (301): return "301-400"
          case (401): return "401-500"
          case (501): return "501-600"
          case (601): return "601-700"
          case (901): return "901-1000"
          default: return value;
        }
      } else if (args[0]==2) {
        switch (value) {
          case (501): return "501-510"
          case (511): return "511-520"
          case (521): return "521-530"
          case (531): return "531-540"
          case (541): return "541-550"
          case (551): return "551-560"
          case (561): return "561-570"
          case (571): return "571-580"
          case (581): return "581-590"
          case (591): return "591-600"
          case (601): return "601-650"
          case (651): return "651-700"
          case (701): return "701-750"
          case (751): return "751-800"
          case (801): return "801-1000"
          default: return value;
        }
      } else if (args[0]==3) {
        return value;
      } else {
        return value;
      };
  }
}
