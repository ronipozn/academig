import {Component, Input} from '@angular/core';

import {privateAnalyticsItems} from '../../../shared/services/private-service';

@Component({
  selector: 'private-analytics-item',
  templateUrl: 'analytics-item.html',
  styleUrls: ['analytics-item.css']
})
export class PrivateAnalyticsItemComponent {
  @Input() analytics: privateAnalyticsItems;
  @Input() sourceType: number; // 0 - lab, 1 - wall
  @Input() streamRetrieved: boolean;
}
