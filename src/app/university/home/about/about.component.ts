import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

import {PublicInfo, SocialInfo} from '../../../shared/services/shared-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'university-about',
  templateUrl: 'about.html',
  styleUrls: ['about.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class UniversityAboutComponent implements OnInit {
  @Input() streamRetrieved: boolean;
  @Input() showEditBtn: boolean;

  @Input() universityCountry: string;
  @Input() universityState: string;
  @Input() universityCity: string;

  @Input() universityLocation: number[];

  @Input() universityExternalLink: string;

  @Input() socialInfo: SocialInfo;
  @Input() publicInfo: PublicInfo;

  @Input() departments: any;
  @Input() categories: any;
  @Input() details: any;

  @Output() buttonLocationClick: EventEmitter <boolean> = new EventEmitter();

  programsLength: number = 0;
  centersLength: number = 0;

  ngOnInit() {
    if (this.categories) {
      this.categories.forEach((category, index) => {
        category.empty = true;
        if (this.departments.findIndex(r => r.categoryId == category.id)>-1) category.empty = false;
        if (category.name=="Programs") this.programsLength = this.departments.filter(r => r.categoryId == category.id).length
        if (category.name=="Centers") this.centersLength = this.departments.filter(r => r.categoryId == category.id).length
      })
    }
  }

  isEmpty(object) {
    const isEmpty = !Object.values(object).some(x => (x !== null && x !== ''));
    return isEmpty
  }
}
