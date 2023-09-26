import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {DomainRequest, AdminService} from '../../../shared/services/admin-service';

@Component({
    selector: 'data',
    templateUrl: 'data.html'
})
export class DataRequestComponent implements OnInit {
  streamRetrieved: boolean;

  requests: DomainRequest[];

  constructor(private titleService: Title,
              private adminService: AdminService) {

    this.titleService.setTitle('Admin Data Requests - Academig');
    this.streamRetrieved = false;
  }

  ngOnInit() {
    this.updateList();
  }

  async updateList() {
    this.streamRetrieved = false;

    this.requests = await this.adminService.getDataRequests();

    this.streamRetrieved = true;
  }

}
