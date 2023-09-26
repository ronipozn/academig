import {Component, Input} from '@angular/core';

import {groupPrivateAnalytic, Analytics} from '../../../shared/services/private-service';

@Component({
  selector: 'private-analytics-table',
  templateUrl: 'analytics-table.html',
  styleUrls: ['analytics-table.css']
})
export class PrivateAnalyticsTableComponent {
  @Input() title: string;
  // @Input() groups: groupPrivateAnalytic;
  @Input() items: Analytics;
  @Input() type: number;
  @Input() modalFlag = true;

  @Input() groupFlag = false;
  @Input() notListedFlag = false;
  @Input() downloadsFlag = false;
  @Input() appliedFlag = false;

  @Input() sourceType: number; // 0 - lab, 1 - wall
  @Input() streamRetrieved: boolean;

  activeInterval = 0;

  changeTimeInerval(interval: number) {
    this.activeInterval = interval;
  }

}
