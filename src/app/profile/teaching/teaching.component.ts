import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {CreateTeaching, UpdateTeaching, Teaching, TeachingService} from '../../shared/services/teaching-service';
import {SharedService} from '../../shared/services/shared-service';

import {Period} from '../../shared/services/shared-service';
import {MissionService} from '../services/mission-service';
import {UserService} from '../../user/services/user-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
  selector: 'profile-teaching',
  templateUrl: 'teaching.html',
  styleUrls: ['teaching.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class TeachingComponent implements OnInit {
  streamTeachings: number[];
  streamTeachingsFollow: number[];

  teachings: Teaching[];

  projId: string;

  streamRetrieved: boolean[];

  itemFocus: number;

  teachingNewFlag = false;
  teachingBuildFlag = false;
  teachingIndex: number;
  teachingBuild: Teaching;

  constructor(private titleService: Title,
              private teachingService: TeachingService,
              private sharedService: SharedService,
              private userService: UserService,
              public missionService: MissionService) {}

  ngOnInit() {
    this.projId = this.missionService.peopleId;
    this.titleService.setTitle('Teaching - ' + this.missionService.peopleName + ' | Academig');
    this.updatePage()
  }

  async updatePage() {
    this.streamRetrieved = [false];

    this.teachings = await this.teachingService.getTeachings(2, this.projId, 1)

    if (this.teachings) {
      this.streamTeachings = new Array(this.teachings.length).fill(0);
      this.streamTeachingsFollow = new Array(this.teachings.length).fill(0);
    } else {
      this.teachings = null;
    }

    this.streamRetrieved[0] = true;
  }

  teachingSlide(flag: boolean, i: number, newFlag: boolean) {
    this.teachingBuild = newFlag ? null : this.teachings[i];
    this.teachingIndex = i;
    this.teachingBuildFlag = flag;
    this.teachingNewFlag = newFlag;
  }

  async teachingUpdate(event, modeNum: number) {
    let createTeaching: CreateTeaching;
    let updateTeaching: UpdateTeaching;

    const period: Period = {
      start: event.start,
      end: event.end,
      mode: event.active[0] ? 2 : 0
    };
    
    if (this.teachingNewFlag == true) {

      createTeaching = {'name': event.title,
                        'pic': event.pic,
                        'period': period,
                        'id': event.id,
                        'location': event.location,
                        'role': event.role,
                        'description': event.description,
                        'university': event.university,
                        'parentId': this.projId,
                        'ai': null
                       };

    } else {

      updateTeaching = {'_id': this.teachings[this.teachingIndex]._id,
                        'name': event.title,
                        'pic': event.pic,
                        'period': period,
                        'id': event.id,
                        'location': event.location,
                        'role': event.role,
                        'description': event.description,
                        'university': event.university
                       };
    }

    const teaching: Teaching = {'_id': (this.teachingNewFlag) ? null : this.teachings[this.teachingIndex]._id,
                                'period': period,
                                'id': event.id,
                                'name': event.title,
                                'pic': event.pic,
                                'location': event.location,
                                'role': event.role,
                                'description': event.description,
                                'university': event.university,
                                'group': null,
                                'profile': null,
                                'views': [0, 0, 0, 0, 0],
                                'followStatus': false
                               };

    if (this.teachingNewFlag == true) {

      this.teachings.push(teaching);
      const loc = this.teachings.length - 1;

      this.streamTeachings[loc] = 3;
      // this.streamTeachingsFollow[loc] = 0;

      this.itemFocus = loc;

      this.teachings[loc]._id = await this.teachingService.putTeaching(createTeaching, 2);

      this.streamTeachings[loc] = 1;
      this.userService.userProgress[11] = true;

    } else {

      this.teachings[this.teachingIndex] = teaching;
      this.streamTeachings[this.teachingIndex] = 3;

      await this.teachingService.postTeaching(updateTeaching, null, 2);

      this.streamTeachings[this.teachingIndex] = 1;
    }

    this.teachingBuildFlag = false;
  }

  async teachingDelete(i: number) {
    this.itemFocus = null;

    let _id: string = this.teachings[i]._id;
    this.streamTeachings[i] = 3;

    await this.teachingService.deleteTeaching(_id, null, 2);

    this.teachings.splice(i, 1);
    this.streamTeachings[i] = 0;
    if (this.teachings.length==0) this.userService.userProgress[11] = false;
  }

  streamFunc() {
    let loc: number = this.teachingNewFlag ? this.teachings.length - 1 : this.teachingIndex;
    this.streamTeachings[loc] = 0;
  }

}
