import {Component, OnInit} from '@angular/core';

import {AdminService} from '../../../shared/services/admin-service';
import {DealService} from '../../../items/services/deal-service';

import * as moment from 'moment';

@Component({
    selector: 'deals',
    templateUrl: 'deals.html'
})
export class ItemsDealsComponent implements OnInit {
  streamRetrieved: boolean = false;
  extendBuildFlag: boolean = false;

  itemIndex: number;

  streamEmail: number = 0;
  streamStatus: number = 0;
  statusTypes = ["-", "Activated", "Deadline Set", "Ended"]

  deals: any[];

  moment: any = moment;

  constructor(private dealService: DealService,
              private adminService: AdminService) { }

  ngOnInit() {
    this.updateList();
  }

  async updateList() {
    this.streamRetrieved = false;
    this.deals = await this.adminService.getDeals();
    this.streamRetrieved = true;
  }

  async statusOp(mode: number, i: number, date: Date) {
    this.deals[i].status = mode;
    if (mode==2) this.deals[i].dateEnd = date;
    this.streamStatus = 3;
    await this.dealService.postStatus(this.deals[i]._id, mode, date);
    this.streamStatus = 0;
  }

  extendOp(mode: number, flag: boolean, i: number, event) {
    this.itemIndex = i;
    this.extendBuildFlag = flag;
    if (mode == 2) this.statusOp(2, i, event.text)
  }

  async emailOp(type: number, i: number) {
    this.deals[i].emails[type] = new Date();
    this.streamEmail = 3;
    await this.dealService.postEmail(this.deals[i]._id, type);
    this.streamEmail = 0;
  }

}
