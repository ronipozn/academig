import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

import { OpenPosition, OpenPositionService } from '../../shared/services/position-service';
import { titlesTypes } from '../../shared/services/people-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
    selector: 'applications',
    templateUrl: 'applications.html',
    styleUrls: ['applications.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class ApplicationsComponent implements OnInit {
  streamRetrieved: boolean;
  streamPositions: number[];
  streamPositionsFollow: number[];

  applications: OpenPosition[][] = [[]];

  tabNum: number;

  titlesTypes = titlesTypes;

  gradesTitles: string[] = ['GPA', 'GRE', 'TOEFL'];
  lettersTitles: string[] = ['Curriculum vitae', 'Letter of motivation', 'Letter of interest', 'Cover letter', 'Project proposal', 'Teaching statement'];

  constructor(private titleService: Title,
              private openPositionService: OpenPositionService
              // public userService: UserService
             ) {
    this.titleService.setTitle('Job Applications | Academig');
  }

  async ngOnInit() {
    this.tabNum = 0;

    this.streamRetrieved = false;
    const positions: OpenPosition[] = await this.openPositionService.getPositions(0, null, 2);

    this.applications[0] = positions.filter(r => r.apply[0].status<100 && r.apply[0].status>9);
    this.applications[1] = positions.filter(r => r.apply[0].status==1);
    this.applications[2] = positions.filter(r => r.apply[0].status>99);

    this.streamPositions = new Array(this.applications[0].length).fill(0);
    this.streamPositionsFollow = new Array(this.applications[0].length).fill(0);
    this.streamRetrieved = true;
  }

  async positionFollow(i: number, j: any) {
    // const itemId: string = this.positions[i]._id;
    // const toFollow: boolean = (this.positions[i].apply[0].status == 1) ? false : true;
    //
    // this.streamFollow[i] = 3;
    //
    // await this.peopleService.toggleFollow(3, 2, itemId, toFollow);
    //
    // this.streamFollow[i] = 0;
    // this.positions[i].apply[0].status = toFollow ? 1 : 0;
    // this.userService.toggleFollow(toFollow, itemId, 3);
  }

  tabClick(i: number) {
    this.tabNum = i;
  }

}
