import {Pipe, PipeTransform} from '@angular/core';
import {GroupSize, CompanySize} from '../../../shared/services/group-service';

@Pipe({
  name: 'name'
})
export class NamePipe implements PipeTransform {
  sizeRange: string;
  groupSize = GroupSize;
  companySize = CompanySize;

  transform(value: any) {
    if (value._id) {
      return value.name;
    }
    return value;
  }
}
