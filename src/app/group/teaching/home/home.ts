import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {MissionService} from '../../services/mission-service';

import {PeopleService} from '../../../shared/services/people-service';
import {CreateTeaching, UpdateTeaching, Teaching, TeachingService} from '../../../shared/services/teaching-service';

import {SharedService, Period} from '../../../shared/services/shared-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-teaching',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupTeachingComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
              private titleService: Title,
              private peopleService: PeopleService,
              private sharedService: SharedService,
              private teachingService: TeachingService,
              public missionService: MissionService) { }

  streamCurrentTeachings: number[];
  streamCurrentTeachingsFollow: number[];

  streamPastTeachings: number[];
  streamPastTeachingsFollow: number[];

  currentTeachings: Teaching[];
  pastTeachings: Teaching[];

  streamRetrieved: boolean[] = [];

  itemFocus: number;
  dragIndex: number;
  modeNum: number;

  teachingNewFlag = false;
  teachingBuildFlag = false;
  teachingIndex: number;
  teachingBuild: Teaching;

  fragment: string;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  ngOnInit() {
    if (this.missionService.groupId) {
      this.titleService.setTitle('Teaching - ' + this.missionService.groupTitle + ' | Academig');
      this.streamRetrieved = [false, false];
      this.updatePage()

      this.route.fragment.subscribe(fragment => {
        this.fragment = fragment
        this.scrollFunc()
      });
    }
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "add": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  async updatePage() {
    this.currentTeachings = await this.teachingService.getTeachings(1, this.missionService.groupId, 0);

    this.streamRetrieved[0] = true;
    this.streamCurrentTeachings = new Array(this.currentTeachings.length).fill(0);
    this.streamCurrentTeachingsFollow = new Array(this.currentTeachings.length).fill(0);

    this.pastTeachings = await this.teachingService.getTeachings(1, this.missionService.groupId, 1);

    this.streamRetrieved[1] = true;
    this.streamPastTeachings = new Array(this.pastTeachings.length).fill(0);
    this.streamPastTeachingsFollow = new Array(this.pastTeachings.length).fill(0);
  }

  ngOnDestroy() {
    // if (this.subscriptionDrag) this.subscriptionDrag.unsubscribe();
    // if (this.subscriptionDrop) this.subscriptionDrop.unsubscribe();
    // this.dragulaService.destroy('current-bag')
    // this.dragulaService.destroy('past-bag')
  }

  teachingSlide(flag: boolean, i: number, newFlag: boolean, newMode: number) {
    this.modeNum = newMode;

    if (newFlag) {
      this.teachingBuild = null;
    } else {
      if (newMode == 0) this.teachingBuild = this.currentTeachings[i];
      if (newMode == 1) this.teachingBuild = this.pastTeachings[i];
    }

    this.teachingIndex = i;
    this.teachingBuildFlag = flag;
    this.teachingNewFlag = newFlag;
  }

  async teachingUpdate(event, modeNum: number) {
    let createTeaching: CreateTeaching;
    let updateTeaching: UpdateTeaching;

    const period: Period = {start: event.start,
                            end: this.modeNum ? event.end : null,
                            mode: this.modeNum ? 0 : 2
                          };

    if (this.teachingNewFlag == true) {

      createTeaching = {'name': event.title,
                        'pic': event.pic,
                        'period': period,
                        'id': event.id,
                        'location': event.location,
                        'role': event.role,
                        'description': event.description,
                        'university': null,
                        'parentId': this.missionService.groupId,
                        'ai': event.intelligence ? event.intelligence[0] : null
                       };

    } else {

      updateTeaching = {'_id': (this.modeNum == 0) ? this.currentTeachings[this.teachingIndex]._id : this.pastTeachings[this.teachingIndex]._id,
                        'name': event.title,
                        'pic': event.pic,
                        'period': period,
                        'id': event.id,
                        'location': event.location,
                        'role': event.role,
                        'description': event.description,
                        'university': null
                       };
    }

    const teaching: Teaching = {'_id': (this.teachingNewFlag) ? null : ((this.modeNum == 0) ? this.currentTeachings[this.teachingIndex]._id : this.pastTeachings[this.teachingIndex]._id),
                                'period': period,
                                'id': event.id,
                                'name': event.title,
                                'pic': event.pic,
                                'location': event.location,
                                'role': event.role,
                                'description': event.description,
                                'university': null,
                                'group': this.missionService.groupIndex,
                                'profile': null,
                                'views': [0, 0, 0, 0, 0],
                                'followStatus': false
                               };

    if (this.modeNum == 0) {

      if (this.teachingNewFlag == true) {

        this.currentTeachings.push(teaching);
        const loc = this.currentTeachings.length - 1;

        this.streamCurrentTeachings[loc] = 3;
        // this.streamCurrentTeachingsFollow[loc] = 0;

        this.itemFocus = loc;

        this.currentTeachings[loc]._id = await this.teachingService.putTeaching(createTeaching, 0);
        this.streamCurrentTeachings[loc] = 1;
        this.missionService.groupProgress[28] = 1;

      } else {

        this.currentTeachings[this.teachingIndex] = teaching;
        this.streamCurrentTeachings[this.teachingIndex] = 3;

        await this.teachingService.postTeaching(updateTeaching, this.missionService.groupId, 0 );
        this.streamCurrentTeachings[this.teachingIndex] = 1;

      }

    } else if (this.modeNum == 1) {

      if (this.teachingNewFlag == true) {

        this.pastTeachings.push(teaching);
        const loc = this.pastTeachings.length - 1;

        this.streamPastTeachings[loc] = 3;
        // this.streamPastTeachingsFollow[loc] = 0;

        this.itemFocus = loc;

        this.pastTeachings[loc]._id = await this.teachingService.putTeaching(createTeaching, 1);
        this.streamPastTeachings[loc] = 1;
        this.missionService.groupProgress[28] = 1;

      } else {

        this.pastTeachings[this.teachingIndex] = teaching;
        this.streamPastTeachings[this.teachingIndex] = 3;

        await this.teachingService.postTeaching(updateTeaching, this.missionService.groupId, 1);
        this.streamPastTeachings[this.teachingIndex] = 1;

      }

    }

    this.teachingBuildFlag = false;
  }

  async teachingDelete(i: number, modeNum: number) {
    this.itemFocus = null;
    let _id: string

    if (modeNum == 0) {
      _id = this.currentTeachings[i]._id;
      this.streamCurrentTeachings[i] = 3;
    } else if (modeNum == 1) {
      _id = this.pastTeachings[i]._id;
      this.streamPastTeachings[i] = 3;
    }

    await this.teachingService.deleteTeaching(_id, this.missionService.groupId, modeNum);

    if (modeNum == 0) {
      this.currentTeachings.splice(i, 1);
      this.streamCurrentTeachings[i] = 0;
    } else if (modeNum == 1) {
      this.pastTeachings.splice(i, 1);
      this.streamPastTeachings[i] = 0;
    }
    if (this.currentTeachings.length == 0 && this.pastTeachings.length == 0) this.missionService.groupProgress[28] = 0;

  }

  async teachingMove(i: number, modeNum: number) {
    let _id: string

    if (modeNum == 0) {
      _id = this.currentTeachings[i]._id;
      this.streamCurrentTeachings[i] = 3;
    } else {
      _id = this.pastTeachings[i]._id;
      this.streamPastTeachings[i] = 3;
    }

    await this.teachingService.moveTeaching(_id, this.missionService.groupId, modeNum);

    if (modeNum == 0) {
        this.currentTeachings[i].period.mode = 0;
        this.currentTeachings[i].period.end = new Date();
        this.pastTeachings.push(this.currentTeachings[i]);
        this.currentTeachings.splice(i, 1);
        this.streamCurrentTeachings[i] = 0;
        this.streamPastTeachings[this.pastTeachings.length - 1] = 0;
        // this.streamPastTeachingsFollow[this.pastTeachings.length - 1] = 0;
    } else {
      this.pastTeachings[i].period.mode = 2;
      this.pastTeachings[i].period.end = null;
      this.currentTeachings.push(this.pastTeachings[i]);
      this.pastTeachings.splice(i, 1);
      this.streamPastTeachings[i] = 0;
      this.streamCurrentTeachings[this.currentTeachings.length - 1] = 0;
      // this.streamCurrentTeachingsFollow[this.currentTeachings.length - 1] = 0;
    }

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
  // }

  // teachingOrder(drag: number, drop: number, bagName: string) {
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

  streamFunc(modeNum: number) {
    let loc: number
    if (modeNum == 0) {
      loc = this.teachingNewFlag ? this.currentTeachings.length - 1 : this.teachingIndex;
      this.streamCurrentTeachings[loc] = 0;
    } else if (modeNum == 1) {
      loc = this.teachingNewFlag ? this.pastTeachings.length - 1 : this.teachingIndex;
      this.streamPastTeachings[loc] = 0;
    }
  }

}
