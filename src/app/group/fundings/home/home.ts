import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {MissionService} from '../../services/mission-service';
import {Funding, fundingPeriods, fundingRole, FundingService} from '../../../shared/services/funding-service';
import {GroupService} from '../../../shared/services/group-service';

import {UserService} from '../../../user/services/user-service';
import {PusherService} from '../../../user/services/pusher.service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-fundings',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupFundingsComponent implements OnInit, OnDestroy {
  // subscriptionDrag = new Subscription();
  // subscriptionDrop = new Subscription();

  streamCurrentFundings: number[];
  streamPastFundings: number[];

  streamCurrentFundingsRole: number[][];
  streamPastFundingsRole: number[][];

  currentFundings: Funding[];
  pastFundings: Funding[];

  streamRetrieved: boolean[] = [];

  itemFocus: number;
  dragIndex: number;
  modeNum: number;

  fundingNewFlag: number;
  fundingBuildFlag: boolean = false;
  fundingIndex: number;
  fundingRoleIndex: number;
  fundingBuild: Funding;

  fragment: string;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor(public route: ActivatedRoute,
              public titleService: Title,
              public groupService: GroupService,
              public fundingService: FundingService,
              public userService: UserService,
              public pusherService: PusherService,
              public missionService: MissionService) { }

  ngOnInit() {
    if (this.missionService.groupId) {

      if (this.missionService.userId) this.notifications();

      this.titleService.setTitle('Fundings - ' + this.missionService.groupTitle + ' | Academig');
      this.streamRetrieved = [false, false];
      this.updatePage();

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
    this.currentFundings = await this.fundingService.getFundings(this.missionService.groupId, 0, 0);

    this.streamRetrieved[0] = true;
    this.streamCurrentFundings = new Array(this.currentFundings.length).fill(0);

    this.streamCurrentFundingsRole = [[0]];
    this.currentFundings.forEach((funding, index) => {
      if (index == 0) {
        this.streamCurrentFundingsRole = [(new Array(funding.roles.length).fill(0))];
      } else {
        this.streamCurrentFundingsRole.push(new Array(funding.roles.length).fill(0));
      }
    });

    this.pastFundings = await this.fundingService.getFundings(this.missionService.groupId, 1, 0);

    this.streamRetrieved[1] = true;
    this.streamPastFundings = new Array(this.pastFundings.length).fill(0);

    this.streamPastFundingsRole = [[0]];
    this.pastFundings.forEach((funding, index) => {
      if (index == 0) {
        this.streamPastFundingsRole = [(new Array(funding.roles.length).fill(0))];
      } else {
        this.streamPastFundingsRole.push(new Array(funding.roles.length).fill(0));
      }
    });
  }

  ngOnDestroy() {
    // if (this.subscriptionDrag) this.subscriptionDrag.unsubscribe();
    // if (this.subscriptionDrop) this.subscriptionDrop.unsubscribe();
    // if (this.userService.userId) this.pusherService.notificationsChannel.unbind();

    // this.dragulaService.destroy('current-bag')
    // this.dragulaService.destroy('past-bag')
  }

  fundingSlide(flag: boolean, i: number, type: number, newMode: number, r: number) {
    this.modeNum = newMode;

    if (newMode == 0) this.fundingBuild = this.currentFundings[i];
    if (newMode == 1) this.fundingBuild = this.pastFundings[i];

    this.fundingIndex = i;
    this.fundingRoleIndex = r;
    this.fundingBuildFlag = flag;
    this.fundingNewFlag = type;
  }

  fundingDecide(i: number, r: number, status: number, newMode: number) {
    if (newMode == 0) {
      if (status == 2) {
        this.postRole(newMode, this.currentFundings[i].roles[r].type, this.currentFundings[i].roles[r].description, i, r);
      } else if (status == 1) {
        this.deleteRole(newMode, 0, i, r);
      };
    } else if (newMode == 1) {
      if (status == 2) {
        this.postRole(newMode, this.pastFundings[i].roles[r].type, this.pastFundings[i].roles[r].description, i, r);
      } else if (status == 1) {
        this.deleteRole(newMode, 0, i, r);
      };
    };
  }

  async fundingUpdate(event) {
    let _id: string;
    let loc: number;

    if (this.fundingNewFlag == 4) { // add Role

      if (this.modeNum == 0) {
        this.currentFundings[this.fundingIndex].roles = this.currentFundings[this.fundingIndex].roles.concat(event.roles);
        _id = this.currentFundings[this.fundingIndex]._id;
        loc = this.currentFundings[this.fundingIndex].roles.length - 1;
        this.streamCurrentFundingsRole[this.fundingIndex][loc] = 3;
      } else {
        this.pastFundings[this.fundingIndex].roles = this.pastFundings[this.fundingIndex].roles.concat(event.roles);
        _id = this.pastFundings[this.fundingIndex]._id;
        this.streamPastFundingsRole[this.fundingIndex][loc] = 3;
      }

      this.addRole(_id, event.roles, loc);

    } else if (this.fundingNewFlag == 3) { // delete Role

      this.deleteRole(this.modeNum, 1, this.fundingIndex, this.fundingRoleIndex);

    } else if (this.fundingNewFlag == 2) { // update Role
      this.postRole(this.modeNum, event.roles[0].type, event.roles[0].description, this.fundingIndex, this.fundingRoleIndex);
      // this.postRole(this.modeNum, event.roles[this.fundingRoleIndex].type, event.roles[this.fundingRoleIndex].description, this.fundingIndex, this.fundingRoleIndex);

    } else { // add or edit Funding

      let v: number;
      const totalAmounts: number[] = new Array(9).fill(0);
      const periods: fundingPeriods[] = [];

      for (let _i = 0; _i < event.periods.length; _i++) {
        v = parseInt(event.periods[_i].amount);
        periods[_i] = {start: event.periods[_i].start,
                     end: event.periods[_i].end,
                     amount: event.periods[_i].amount,
                     currency: event.periods[_i].currency,
                     mode: (event.periods[_i].single[0] == true ? 2 : (event.periods[_i].present[0] == true ? 1 : 0))
                    }

        let a, c: number;
        a = parseInt(event.periods[_i].amount);
        c = parseInt(event.periods[_i].currency);
        totalAmounts[c] += a ? a : 0;
      }

      const funding: Funding = {
                                '_id': (this.fundingNewFlag == 1) ? null :
                                                                  (
                                                                    (this.modeNum == 0) ? this.currentFundings[this.fundingIndex]._id :
                                                                                        this.pastFundings[this.fundingIndex]._id
                                                                  ),
                                'name': event.name,
                                'groups': [],
                                'officalId': event.officalId,
                                'pic': event.pic,
                                'abbr': event.abbr,
                                'link': event.link,
                                'description': event.description,
                                'periods': periods,
                                'totalAmounts': totalAmounts,
                                'roles': event.roles,
                                // "projects": event.projects
                                'projects': [],
                                'ai': event.intelligence ? event.intelligence[0] : null
                               };

      if (this.modeNum == 0) { // Current Funding

        if (this.fundingNewFlag == 1) { // add current Funding
          this.currentFundings.push(funding);
          loc = this.currentFundings.length - 1;

          this.streamCurrentFundings[loc] = 3;
          this.streamCurrentFundingsRole[loc] = new Array(this.currentFundings[loc].roles.length).fill(0);

          this.itemFocus = loc;

          this.currentFundings[loc]._id = await this.fundingService.putFunding(funding, this.missionService.groupId, 0);

          this.streamCurrentFundings[loc] = 1;
          this.missionService.groupProgress[13] = 1;

        } else { // edit current Funding

          funding.roles = this.currentFundings[this.fundingIndex].roles; // FIX: don't send Roles at all

          this.currentFundings[this.fundingIndex] = funding;
          this.streamCurrentFundings[this.fundingIndex] = 3;

          await this.fundingService.postFunding(funding, this.currentFundings[this.fundingIndex]._id, this.missionService.groupId);

          this.streamCurrentFundings[this.fundingIndex] = 1;
        }

      } else if (this.modeNum == 1) { // Past Funding

        if (this.fundingNewFlag == 1) { // add past Funding

          this.pastFundings.push(funding);
          loc = this.pastFundings.length - 1;

          this.streamPastFundings[loc] = 3;

          this.itemFocus = loc;

          this.pastFundings[loc]._id = await this.fundingService.putFunding(funding, this.missionService.groupId, 1);

          this.streamPastFundings[loc] = 1;
          this.streamPastFundingsRole[loc] = new Array(this.pastFundings[loc].roles.length).fill(0);
          this.missionService.groupProgress[13] = 1;

        } else { // edit past Funding

          funding.roles = this.pastFundings[this.fundingIndex].roles;

          this.pastFundings[this.fundingIndex] = funding;
          this.streamPastFundings[this.fundingIndex] = 3;

          await this.fundingService.postFunding(funding, this.pastFundings[this.fundingIndex]._id, this.missionService.groupId);

          this.streamPastFundings[this.fundingIndex] = 1;

        }
      }

    }

    this.fundingBuildFlag = false;
  }

  async fundingDelete(i: number, modeNum: number) {
    this.itemFocus = null;
    let _id: string

    if (modeNum == 0) {
      _id = this.currentFundings[i]._id;
      this.streamCurrentFundings[i] = 3;
    } else if (modeNum == 1) {
      _id = this.pastFundings[i]._id;
      this.streamPastFundings[i] = 3;
    }

    await this.fundingService.deleteFunding(_id, this.missionService.groupId, modeNum);

    if (modeNum == 0) {
      this.currentFundings.splice(i, 1);
      this.streamCurrentFundings[i] = 0;
    } else {
      this.pastFundings.splice(i, 1);
      this.streamPastFundings[i] = 0;
    }

    if (this.currentFundings.length == 0 && this.pastFundings.length == 0) this.missionService.groupProgress[13] = 0;
  }

  async addRole(_id: string, roles: fundingRole[], loc: number) {
    const roleId: string = await this.fundingService.putFundingRoles(_id, this.missionService.groupId, roles);

    // console.log('roleId',roleId)
    if (this.modeNum == 0) {
      this.streamCurrentFundingsRole[this.fundingIndex][loc] = 0;
    } else {
      this.streamPastFundingsRole[this.fundingIndex][loc] = 0;
    }
  }

  async postRole(mode: number, type: number, description: string, fundIndex: number, roleIndex: number) {
    let _id: string;
    // var roleId: string;

    if (mode == 0) {
      _id = this.currentFundings[fundIndex]._id;
      // roleId = this.currentFundings[fundIndex].roles[roleIndex].member._id;

      this.currentFundings[fundIndex].roles[roleIndex].status = 2;
      this.currentFundings[fundIndex].roles[roleIndex].type = type;
      this.currentFundings[fundIndex].roles[roleIndex].description = description;

      this.streamCurrentFundingsRole[fundIndex][roleIndex] = 3;
    } else {
      _id = this.pastFundings[fundIndex]._id;
      // roleId = this.pastFundings[fundIndex].roles[roleIndex].member._id;

      this.pastFundings[fundIndex].roles[roleIndex].type = type;
      this.pastFundings[fundIndex].roles[roleIndex].description = description;

      this.streamPastFundingsRole[fundIndex][roleIndex] = 3;
    }

    await this.fundingService.postFundingRole(_id, type, description);

    if (mode == 0) {
      this.streamCurrentFundingsRole[fundIndex][roleIndex] = 0;
    } else {
      this.streamPastFundingsRole[fundIndex][roleIndex] = 0;
    }
  }

  async deleteRole(mode: number, type: number, fundIndex: number, roleIndex: number) {
    let _id: string;
    let roleId: string;

    if (mode == 0) {
      _id = this.currentFundings[fundIndex]._id;
      roleId = this.currentFundings[fundIndex].roles[roleIndex].member._id;

      this.streamCurrentFundingsRole[fundIndex][roleIndex] = 3;
    } else {
      _id = this.pastFundings[fundIndex]._id;
      roleId = this.pastFundings[fundIndex].roles[roleIndex].member._id;

      this.streamPastFundingsRole[fundIndex][roleIndex] = 3;
    }

    await this.fundingService.deleteFundingRole(_id, roleId, this.missionService.groupId, type);

    if (mode == 0) {
      this.streamCurrentFundingsRole[fundIndex][roleIndex] = 0;
      this.currentFundings[fundIndex].roles.splice(roleIndex, 1);
    } else {
      this.streamPastFundingsRole[fundIndex][roleIndex] = 0;
      this.pastFundings[fundIndex].roles.splice(roleIndex, 1);
    }
  }

  async fundingOrder(drag: number, drop: number, bagName: string) {
    let modeNum: number;
    let itemId: string;

    if (bagName == 'current-bag') {
      modeNum = 0;
      this.streamCurrentFundings[drop] = 3;
      itemId = this.currentFundings[drag]._id;
    } else {
      modeNum = 1;
      this.streamPastFundings[drop] = 3;
      itemId = this.pastFundings[drag]._id;
    }

    await this.groupService.orderItems(this.missionService.groupId, itemId, 0, 4, modeNum, drag, drop);

    if (modeNum == 0) {
      this.streamCurrentFundings[drop] = 0;
    } else {
      this.streamPastFundings[drop] = 0;
    }
  }

  streamFunc(modeNum: number) {
    let loc: number

    if (modeNum == 0) {
      loc = (this.fundingNewFlag == 1) ? this.currentFundings.length - 1 : this.fundingIndex;
      this.streamCurrentFundings[loc] = 0;
    } else if (modeNum == 1) {
      loc = (this.fundingNewFlag == 1) ? this.pastFundings.length - 1 : this.fundingIndex;
      this.streamPastFundings[loc] = 0;
    }
  }

  public notifications() {
    this.pusherService.notificationsChannel.bind('notifications', data => {
      // console.log('floor', Math.floor(data.verb / 1000))
      if ((Math.floor(data.verb / 1000) == 11 || data.verb == 1006 || data.verb == 1106) && (data.actor != this.userService.userId)) {
        this.updatePage();
      };
    });
  }

}
