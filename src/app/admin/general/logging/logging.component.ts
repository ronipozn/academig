import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {Logging, AdminService} from '../../../shared/services/admin-service';

@Component({
    selector: 'logging',
    templateUrl: 'logging.html'
})
export class LoggingComponent implements OnInit {
  streamRetrieved: boolean;

  streamPublications: number[];

  loggings: Logging[];

  constructor(private titleService: Title,
              private adminService: AdminService) {

    this.titleService.setTitle('Admin Logging | Academig');
    this.streamRetrieved = false;
  }

  ngOnInit() {
    this.updateList();
  }

  async updateList() {
    this.streamRetrieved = false;
    this.loggings = await this.adminService.getItemsLoggings();
    this.streamRetrieved = true;
  }

}
