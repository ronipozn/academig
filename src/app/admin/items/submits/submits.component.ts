import {Component, OnInit} from '@angular/core';

import {AdminService} from '../../../shared/services/admin-service';
import {SubmitTrend, SubmitPodcast, SubmitEvent, SubmitApp} from '../../../items/services/item-service';

@Component({
    selector: 'submits',
    templateUrl: 'submits.html'
})
export class ItemsSubmitsComponent implements OnInit {
  streamRetrieved: boolean[] = [false, false, false, false];

  trends: SubmitTrend[];
  podcasts: SubmitPodcast[];
  events: SubmitEvent[];
  apps: SubmitApp[];

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.updateList(0);
    this.updateList(1);
    this.updateList(2);
    this.updateList(3);
  }

  async updateList(type) {
    this.streamRetrieved[type] = false;
    switch (type) {
      case 'trends': this.trends = await this.adminService.getTrendsSubmit(); break;
      case 'podcasts': this.podcasts = await this.adminService.getPodcastsSubmit(); break;
      case 'events': this.events = await this.adminService.getEventsSubmit(); break;
      case 'apps': this.apps = await this.adminService.getAppsSubmit(); break;
    }
    this.streamRetrieved[type] = true;
  }

}
