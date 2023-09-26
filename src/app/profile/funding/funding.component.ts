import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {ProfileSortService, PeopleService} from '../../shared/services/people-service';

import {Funding, FundingProfile, FundingService} from '../../shared/services/funding-service';

import {groupComplex, Period, SharedService} from '../../shared/services/shared-service';

import {MissionService} from '../services/mission-service';

import {UserService} from '../../user/services/user-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
  selector: 'profile-funding',
  templateUrl: 'funding.html',
  styleUrls: ['funding.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class FundingComponent {
  streamFundings: number[];
  streamGroupsFunding: number[];
  streamGroupsFundingRole: number[][];

  groupsFundings: Funding[];
  userGroups: groupComplex[];

  fundingGroupNewFlag: number;
  fundingGroupBuild: Funding;
  fundingRoleIndex: number;
  fundingGroupBuildFlag: boolean = false;

  fundings: FundingProfile[];
  fundingsSort: FundingProfile[];

  projId: string;
  sourceType = 1; // 0 - group, 1 - wall

  streamRetrieved: boolean[];

  theadTexts: string[] = ['Years', 'Description'];

  itemFocus: number;

  fundingIndex: number;
  fundingNewFlag = false;
  fundingBuildFlag = false;

  constructor(private titleService: Title,
              private peopleService: PeopleService,
              private fundingService: FundingService,
              private sharedService: SharedService,
              public userService: UserService,
              public missionService: MissionService,
              private sortService: ProfileSortService) {}

  ngOnInit() {
    this.projId = this.missionService.peopleId;
    this.streamRetrieved = [false,false];
    this.userGroups = this.userService.userPositions.filter(r => r.status >= 6).map(r => r.group)
    this.titleService.setTitle('Funding - ' + this.missionService.peopleName + ' | Academig');

    this.getProfileFunndingItems()
    this.getGroupsFunndingItems()
  }

  async getProfileFunndingItems() {
    this.streamRetrieved[0] = false;

    this.fundings = await this.fundingService.getProfileFundings(this.projId);

    if (this.fundings) {
      this.streamFundings = new Array(this.fundings.length).fill(0);
      this.fundingsSort = this.fundings.slice(0); // avoid mutating, duplicate array instead
      this.sortService.arraySort(this.fundingsSort);
    } else {
      this.streamFundings = [];
      this.fundings = [];
      this.fundingsSort = [];
    }

    this.streamRetrieved[0] = true;
  }

  fundingEdit(flag: boolean, newFlag: boolean, _id: string) {
    this.fundingBuildFlag = flag;
    this.fundingNewFlag = newFlag;
    this.fundingIndex = this.fundings.findIndex(x => x._id == _id);
    // this.teachingIndex = this.teachings.findIndex(x => x._id == _id);
  }

  async fundingUpdate(event) {
    let funding: FundingProfile;
    // let teaching: Teaching;
    let loc: number;

    var period: Period = {
      'start': event.start,
      'end': event.single[0] ? null : event.end,
      'mode': event.single[0] ? 2 : (event.present[0] ? 1 : 0)
     }

    funding = {'_id': this.fundingNewFlag ? null : this.fundings[this.fundingIndex]._id,
              'period': period,
              'name': event.name,
              'pic': null,
              'link': event.link,
              'abbr': event.abbr,
              'officalId': event.officalId,
              'description': event.description,
             };

    if (this.fundingNewFlag) {
     this.fundings.push(funding);
     loc = this.fundings.length - 1;
    } else {
     this.fundings[this.fundingIndex] = funding;
    }

    this.fundingsSort = this.fundings.slice(0); // avoid mutating, duplicate array instead
    this.sortService.arraySort(this.fundingsSort);

    if (this.fundingNewFlag == true) {
      this.streamFundings[loc] = 3;
      this.itemFocus = loc;

      this.fundings[loc]._id = await this.peopleService.putTable(9, this.projId, null, null, null, null, null, null, null, null, null, funding);

      this.userService.userProgress[10] = true;
      this.streamFundings[loc] = 1;

    } else {

      this.streamFundings[this.fundingIndex] = 3;

      await this.peopleService.postTable(9, this.projId, null, null, null, null, null, null, null, null, null, funding);

      this.streamFundings[this.fundingIndex] = 1;

    }

    this.fundingBuildFlag = false;
  }

  async fundingDelete(iSort: number, _id: string) {
    this.itemFocus = null;

    let i: number = this.fundings.findIndex(x => x._id == _id);

    this.streamFundings[iSort] = 3;

    await this.peopleService.deleteTable(9, _id);

    this.fundings.splice(i, 1);
    this.fundingsSort = this.fundings.slice(0); // avoid mutating, duplicate array instead
    this.sortService.arraySort(this.fundingsSort);
    if (this.fundings.length==0) this.userService.userProgress[10] = false;
    this.streamFundings[iSort] = 0;
  }

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////

  async getGroupsFunndingItems() {
    this.streamRetrieved[1] = false;

    this.groupsFundings = await this.fundingService.getFundings(this.projId, 0, 1);

    this.streamRetrieved[1] = true;
    this.streamGroupsFunding = new Array(this.groupsFundings.length).fill(0);

    this.groupsFundings.forEach((funding, index) => {
      if (index == 0) {
        this.streamGroupsFundingRole = [(new Array(funding.roles.length).fill(0))];
      } else {
        this.streamGroupsFundingRole.push(new Array(funding.roles.length).fill(0));
      }
    });
  }

  fundingGroupSlide(flag: boolean, i: number, type: number, r: number) {
    this.fundingGroupBuild = this.groupsFundings[i];
    this.fundingIndex = i;
    this.fundingRoleIndex = r;
    this.fundingGroupBuildFlag = flag;
    this.fundingGroupNewFlag = type;
  }

  async postRole(type: number, description: string, fundIndex: number, roleIndex: number) {
    let _id: string = this.groupsFundings[fundIndex]._id;

    this.groupsFundings[fundIndex].roles[roleIndex].status = 2;
    this.groupsFundings[fundIndex].roles[roleIndex].type = type;
    this.groupsFundings[fundIndex].roles[roleIndex].description = description;

    this.streamGroupsFundingRole[fundIndex][roleIndex] = 3;

    await this.fundingService.postFundingRole(_id, type, description);

    this.streamGroupsFundingRole[fundIndex][roleIndex] = 0;
  }

  async deleteRole(type: number, fundIndex: number, roleIndex: number) {
    let _id: string = this.groupsFundings[fundIndex]._id;
    let roleId: string = this.groupsFundings[fundIndex].roles[roleIndex].member._id;

    this.streamGroupsFundingRole[fundIndex][roleIndex] = 3;

    // this.missionService.groupId
    await this.fundingService.deleteFundingRole(_id, roleId, null, type);

    this.streamGroupsFundingRole[fundIndex][roleIndex] = 0;
    this.groupsFundings[fundIndex].roles.splice(roleIndex, 1);
  }

  async fundingGroupPut(event) {
    const i = event.index;
    this.streamGroupsFunding[i] = 3;

    await this.fundingService.putFundingGroup(this.groupsFundings[event.index]._id, event.groupId);

    this.streamGroupsFunding[i] = 0;
  }

  async fundingGroupDelete(event) {
    const i = event.index;
    this.streamGroupsFunding[i] = 3;

    await this.fundingService.deleteFundingGroup(this.groupsFundings[event.index]._id, event.groupId);

    this.streamGroupsFunding[i] = 0
  }

  fundingGroupUpdate(event) {
    let _id: string;
    let loc: number;

    if (this.fundingGroupNewFlag == 3) { // delete Role

      this.deleteRole(1, this.fundingIndex, this.fundingRoleIndex);

    } else if (this.fundingGroupNewFlag == 2) { // update Role

      this.postRole(event.roles[0].type, event.roles[0].description, this.fundingIndex, this.fundingRoleIndex);

    }

    this.fundingBuildFlag = false;
  }

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////

  streamFunc(i: number) {
    let loc: number
    if (this.fundingNewFlag) {
      loc = this.fundings.length - 1;
        // loc = this.teachings.length - 1;
    } else {
      loc = this.fundingIndex;
    }
    this.streamFundings[loc] = 0;
  }

}
