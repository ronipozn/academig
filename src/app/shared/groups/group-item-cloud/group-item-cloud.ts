import {Component, Input} from '@angular/core';

import {groupComplex} from '../../services/shared-service';

@Component({
  selector: 'group-item-cloud',
  templateUrl: 'group-item-cloud.html',
  styleUrls: ['group-item-cloud.css']
})
export class GroupItemCloudComponent {
  @Input() groupIndex: groupComplex;

  acronym: string;

  ngOnInit() {
    if (this.groupIndex) {
      this.acronym = this.groupIndex.group.name.match(/\b(\w)/g).join('').substring(0, 2).toUpperCase();
    };
  }

}
