import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

import {DealService} from '../../items/services/deal-service';

import {itemsAnimation} from '../../shared/animations/index';

import * as moment from 'moment';

@Component({
    selector: 'deals',
    templateUrl: 'deals.html',
    styleUrls: ['deals.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class DealsComponent implements OnInit {
  streamRetrieved: boolean;
  buyStatus = ['Not Redeemed', 'Redeemed', 'Refunded'];

  moment: any = moment;

  statusFilter: number = -1;

  deals: any;
  dealsFilterd: any;

  constructor(private titleService: Title,
              private dealService: DealService
              // public userService: UserService
             ) {
    this.titleService.setTitle('My Deals | Academig');
  }

  async ngOnInit() {
    this.streamRetrieved = false;
    this.deals = await this.dealService.getDeals();
    this.dealsFilterd = this.deals;
    this.streamRetrieved = true;
  }

  searchKeyUpOp(query: string) {
    this.dealsFilterd = this.deals.filter(r=>r.name.toLowerCase().indexOf(query.toLowerCase())>-1);
  }

}
