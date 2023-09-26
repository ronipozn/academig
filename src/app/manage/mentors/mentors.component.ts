import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

import { OpenPosition, OpenPositionService } from '../../shared/services/position-service';
import { titlesTypes } from '../../shared/services/people-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
    selector: 'mentors',
    templateUrl: 'mentors.html',
    styleUrls: ['mentors.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class MentorsComponent implements OnInit {
  streamRetrieved: boolean;
  streamPositions: number[];
  streamPositionsFollow: number[];

  constructor(private titleService: Title,
              private openPositionService: OpenPositionService
              // public userService: UserService
             ) {
    this.titleService.setTitle('My Mentors | Academig');
  }

  async ngOnInit() {
    this.streamRetrieved = false;
    const positions: OpenPosition[] = await this.openPositionService.getPositions(0, null, 2);

    // this.applications[0] = positions.filter(r => r.apply[0].status<100 && r.apply[0].status>9);
    // this.applications[1] = positions.filter(r => r.apply[0].status==1);
    // this.applications[2] = positions.filter(r => r.apply[0].status>99);
    //
    // this.streamPositions = new Array(this.applications[0].length).fill(0);
    // this.streamPositionsFollow = new Array(this.applications[0].length).fill(0);
    this.streamRetrieved = true;
  }

}
