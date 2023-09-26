import {Component, Input, Output, EventEmitter} from '@angular/core';

import {PublicInfo, SocialInfo} from '../../../shared/services/shared-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'department-about',
  templateUrl: 'about.html',
  styleUrls: ['about.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class DepartmentAboutComponent {
  @Input() streamRetrieved: boolean;
  @Input() showEditBtn: boolean;

  @Input() departmentCountry: string;
  @Input() departmentState: string;
  @Input() departmentCity: string;

  @Input() departmentLocation: number[];

  @Input() departmentExternalLink: string;

  @Input() socialInfo: SocialInfo;
  @Input() publicInfo: PublicInfo;

  @Input() details: any;
  @Input() groupsLength: number;

  @Output() buttonLocationClick: EventEmitter <boolean> = new EventEmitter();

  // https://stackoverflow.com/questions/27709636/determining-if-all-attributes-on-a-javascript-object-are-null-or-an-empty-string
  isEmpty(object) {
    const isEmpty = !Object.values(object).some(x => (x !== null && x !== ''));
    return isEmpty
  }
}
