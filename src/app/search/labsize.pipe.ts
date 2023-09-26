import {Pipe, PipeTransform} from '@angular/core';
import {GroupSize, CompanySize} from '../shared/services/group-service';

@Pipe({
  name: 'labSize'
})
export class LabsizePipe implements PipeTransform {
  sizeRange: string;
  groupSize = GroupSize;
  companySize = CompanySize;

  transform(value: any) {
    if (value) {
      // this.labFlag
      this.sizeRange = 1 ?
        this.groupSize[this.groupSize.findIndex(y => y.id == value)].name :
        this.companySize[this.companySize.findIndex(y => y.id == value)].name;

      return this.sizeRange;
    }
    return '-';
  }
}
