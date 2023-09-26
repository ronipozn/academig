import {Component, Input, OnChanges} from '@angular/core';

import {complexName} from '../../services/shared-service';

@Component({
    selector: 'breadcrumbs',
    templateUrl: 'bread.html',
    styleUrls: ['bread.css']
})
export class BreadComponent implements OnChanges {
  @Input() country: string;
  @Input() state: string;
  @Input() city: string;

  @Input() university: complexName;
  @Input() department: complexName;
  @Input() group: complexName;

  @Input() page: string;
  @Input() subPage: string;
  @Input() subSubPage: string;

  @Input() detailsName: string;
  @Input() detailsStream: number;

  @Input() mode: number;

  universityLink: string;
  departmentLink: string;
  groupLink: string;
  pageLink: string;
  subPageLink: string;

  ngOnChanges() {
    if (this.mode>=0) this.universityLink = '/' + this.university.link;

    if (this.mode==0) this.pageLink = this.universityLink + '/' + this.page;

    if (this.mode>=1) {
      this.departmentLink = this.universityLink + '/' + this.department.link;
      this.pageLink = this.departmentLink + '/' + this.page;
    }

    if (this.mode>=2) {
      this.groupLink = this.departmentLink + '/' + this.group.link;
      this.pageLink = this.groupLink + '/' + this.page;
    }

    this.subPageLink = this.pageLink + '/' + this.subPage;
  }

}
