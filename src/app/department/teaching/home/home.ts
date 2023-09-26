import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../../services/mission-service';

import {PeopleService} from '../../../shared/services/people-service';
import {Teaching, TeachingService} from '../../../shared/services/teaching-service';

@Component({
  selector: 'department-teaching',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class DepartmentTeachingComponent implements OnInit {

  constructor(private titleService: Title,
              private peopleService: PeopleService,
              private teachingService: TeachingService,
              public missionService: MissionService) { }

  stream: number[];
  streamFollow: number[];

  teachings: Teaching[] = [];

  streamRetrieved: boolean;

  streamMore: boolean;

  text: string;
  type: number;
  count = 0;
  more = 0;
  moreFlag = false;

  ngOnInit() {
    if (this.missionService.departmentId) {
      this.titleService.setTitle('Teaching - ' + this.missionService.departmentTitle + ' | Academig');
    }

    this.findTeachings()
  }

  async findTeachings() {
    this.streamRetrieved = false;

    const teachings = await this.teachingService.getTeachings(this.missionService.searchFlag ? 5 : 4, this.missionService.departmentId, 0, this.missionService.searchText);

    if (teachings) {
      this.teachings.push.apply(this.teachings, teachings);

      this.count = Number(this.teachings[this.teachings.length - 1]);
      this.teachings.pop();
      this.moreFlag = this.count > ((this.more + 1) * 10);
      this.streamMore = true;
      this.stream = new Array(this.teachings.length).fill(0);
      this.streamFollow = new Array(this.teachings.length).fill(0);

    } else {

      this.teachings = [];

    }

    this.streamRetrieved = true;
  }

  showMoreFunc() {
    this.more += 1;
    this.streamMore = false;
    this.findTeachings();
  }

  // teachingFollow(i: number, modeNum: number) {
  //
  //   const itemId: string = (modeNum == 0) ? this.currentTeachings[i]._id : this.pastTeachings[i]._id;
  //
  //   let toFollow: boolean;
  //
  //   if (modeNum == 0) {
  //     toFollow = !this.currentTeachings[i].followStatus;
  //     this.streamCurrentTeachingsFollow[i] = 3;
  //   } else {
  //     toFollow = !this.pastTeachings[i].followStatus;
  //     this.streamPastTeachingsFollow[i] = 3;
  //   }
  //
  //   this.subscriptionFollow = this.peopleService.toggleFollow(2, 0, itemId, toFollow).subscribe(
  //     result => {},
  //     err => {
  //             console.log('Can\'t toggle follow. Error code: %s, URL: %s, Error: %s, Message: %s', err.status, err.url, err.error, err.message);
  //
  //             if (modeNum == 0) {
  //               this.streamCurrentTeachingsFollow[i] = 2;
  //             } else {
  //               this.streamPastTeachingsFollow[i] = 2;
  //             }
  //           },
  //     () => {
  //             console.log('Follow updated')
  //
  //             if (modeNum == 0) {
  //               this.currentTeachings[i].followStatus = toFollow;
  //               this.streamCurrentTeachingsFollow[i] = 0;
  //             } else {
  //               this.pastTeachings[i].followStatus = toFollow;
  //               this.streamPastTeachingsFollow[i] = 0;
  //             }
  //           }
  //   );
  //
  // }

  // teachingOrder(drag: number, drop: number, bagName: string) {
  //
  //   let modeNum: number
  //   let itemId: string
  //
  //   if (bagName == 'current-bag') {
  //     modeNum = 0;
  //     this.streamCurrentTeachings[drop] = 3;
  //     itemId = this.currentTeachings[drag]._id;
  //   } else {
  //     modeNum = 1;
  //     this.streamPastTeachings[drop] = 3;
  //     itemId = this.pastTeachings[drag]._id;
  //   }
  //
  //   this.subscriptionOrder = this.groupService.orderItems(this.missionService.groupId, itemId, 0, 2, modeNum, drag, drop).subscribe(
  //     result => {},
  //     err => {
  //             console.log('Can\'t update order. Error code: %s, URL: %s, Error: %s, Message: %s', err.status, err.url, err.error, err.message);
  //             if (modeNum == 0) {
  //               this.streamCurrentTeachings[drop] = 2;
  //             } else {
  //               this.streamPastTeachings[drop] = 2;
  //             }
  //           },
  //     () => {
  //             console.log('Order updated')
  //             if (modeNum == 0) {
  //               this.streamCurrentTeachings[drop] = 0;
  //             } else {
  //               this.streamPastTeachings[drop] = 0;
  //             }
  //           }
  //   );
  //
  // }

  // streamFunc(modeNum: number) {
  //   let loc: number
  //   loc = this.teachingNewFlag ? this.currentTeachings.length - 1 : this.teachingIndex;
  //   this.streamCurrentTeachings[loc] = 0;
  // }

}
