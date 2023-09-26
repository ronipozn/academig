import {Component, Input, Output, EventEmitter} from '@angular/core';

import {MissionService} from '../services/mission-service';
import {SupportService} from '../../shared/services/support-service';

@Component({
    selector: 'search-filters',
    templateUrl: 'search-filters.html',
    styleUrls: ['search-filters.css']
})
export class SearchFiltersComponent {
  @Input() userId: string;
  @Input() planNumber: number = 0;
  @Input() sourceType: number = 0;

  @Input() isMobile: boolean;
  @Input() expandFlag: boolean;
  @Input() adminFlag: boolean;

  @Output() upgradeMode: EventEmitter <number> = new EventEmitter();

  refinements: any;

  filtersFlag: boolean = true;
  filtersFlagMobile: boolean = false;

  message: string;
  submitFlag: number = 0;

  constructor(public missionService: MissionService,
              private supportService: SupportService,) {
  }

  async suggestUpdate() {
    this.submitFlag = 1;
    await this.supportService.putSupport(this.userId, null, 8, 'search_filter_suggestion', this.message);
    this.submitFlag = 2;
    this.message = '';
  }

  async upgrageFilters() {
    this.upgradeMode.emit(0);
  }

}
