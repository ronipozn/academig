import {Component, Input} from '@angular/core';
import {groupComplex} from '../../services/shared-service';

@Component({
    selector: 'group-link',
    templateUrl: 'group-link.html',
    styleUrls: ['group-link.css']
})
export class GroupLinkComponent {
  @Input() groupIndex: groupComplex;
  @Input() flag: number = 0;
  @Input() smallFlag = true;
}
