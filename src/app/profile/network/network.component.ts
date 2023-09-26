import {Component, Input, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {People, PeopleService} from '../../shared/services/people-service';
import {UserService} from '../../user/services/user-service';
import {objectMini, SharedService} from '../../shared/services/shared-service';
import {GroupCompareMini, Group, GroupService} from '../../shared/services/group-service';

import {MissionService} from '../services/mission-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
  selector: 'profile-network',
  templateUrl: 'network.html',
  styleUrls: ['network.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class NetworkComponent implements OnInit, OnDestroy {
  peoplesFollowing: People[] = [];
  peoplesFollowers: People[] = [];
  peoplesCoauthors: People[] = [];
  peoplesDummyCoauthors: objectMini[] = [];

  groupsFollowing: Group[] = [];

  streamRetrieved: boolean[] = [false, false, false, false, false];
  activeTab: number;

  streamPeopleFollowing: number[];
  streamPeopleFollowingFollow: number[];

  streamPeopleFollowers: number[];
  streamPeopleFollowersFollow: number[];

  streamPeopleCoauthors: number[];
  streamPeopleCoauthorsFollow: number[];

  streamPeopleDummyCoauthors: number[] = [];

  streamGroupFollowing: number[];
  streamGroupFollowed: number[];
  streamGroupFollowingCompare: number[];
  compareFollowingStatuses: boolean[] = [];
  streamGroupAdminFollowing: number[][];

  constructor(public titleService: Title,
              public peopleService: PeopleService,
              public groupService: GroupService,
              public sharedService: SharedService,
              public missionService: MissionService,
              public userService: UserService,
              private _router: Router) {
  }

  ngOnInit() {
    this.titleService.setTitle('Network - ' + this.missionService.peopleName + ' | Academig');
    this.streamRetrieved = [false, false, false, false, false];
    this.activeTab = this.missionService.activeTab;
    this.peoplesFollowingFunc(this.activeTab);
    this.groupsFollowingFunc();
  }

  async groupsFollowingFunc() {
    const data = await this.groupService.getGroups(11, this.missionService.peopleId, this.missionService.peopleId, 0);
    this.groupsFollowing = data;

    const adminGroupsLength = this.userService.userPositions.length;

    this.streamGroupFollowing = new Array(this.groupsFollowing.length).fill(0);
    this.streamGroupFollowingCompare = new Array(this.groupsFollowing.length).fill(0);
    this.streamGroupAdminFollowing = Array(this.groupsFollowing.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
    this.compareFollowingStatuses = this.groupsFollowing.map(r => this.userService.userCompareGroups.map(u => u.groupIndex.group._id).indexOf(r._id)>-1);
    this.streamRetrieved[4] = true;
  }

  async peoplesFollowingFunc(tabNum: number) {

    this.activeTab = tabNum;

    const getMode: number[] = [8, 5, 9];

    if (this.streamRetrieved[tabNum] == false) {

      const data = await this.peopleService.getPeoples(getMode[tabNum], this.missionService.peopleId, null, (tabNum==2) ? 1 : 9, 0);

      if (tabNum == 0) {
        this.peoplesFollowing = data;
        this.streamPeopleFollowing = new Array(this.peoplesFollowing.length).fill(0);
        this.streamPeopleFollowingFollow = new Array(this.peoplesFollowing.length).fill(0);
      } else if (tabNum == 1) {
        this.peoplesFollowers = data;
        this.streamPeopleFollowers = new Array(this.peoplesFollowers.length).fill(0);
        this.streamPeopleFollowersFollow = new Array(this.peoplesFollowers.length).fill(0);
      } else if (tabNum == 2) {
        this.peoplesCoauthors = data;
        this.streamPeopleCoauthors = new Array(this.peoplesCoauthors.length).fill(0);
        this.streamPeopleCoauthorsFollow = new Array(this.peoplesCoauthors.length).fill(0);
      }

      this.streamRetrieved[tabNum] = true;

    }

    if (tabNum==2) {

      this.peoplesDummyCoauthors = await this.sharedService.getCoAuthors(1, this.missionService.peopleId);

      this.streamRetrieved[3] = true;
      this.streamPeopleDummyCoauthors = new Array(this.peoplesDummyCoauthors.length).fill(0);

    }

  }

  ngOnDestroy() {
    this.missionService.activeTab=1;
  }

  async peopleFollow(i: number) {
    let itemId: string;
    let toFollow: boolean;
    if (this.activeTab==0) {
      itemId = this.peoplesFollowing[i]._id;
      toFollow = !this.peoplesFollowing[i].followStatus;
      this.streamPeopleFollowingFollow[i] = 3;
    } else if (this.activeTab==1) {
      itemId = this.peoplesFollowers[i]._id;
      toFollow = !this.peoplesFollowers[i].followStatus;
      this.streamPeopleFollowersFollow[i] = 3;
    } else {
      itemId = this.peoplesCoauthors[i]._id;
      toFollow = !this.peoplesCoauthors[i].followStatus;
      this.streamPeopleCoauthorsFollow[i] = 3;
    }
    await this.peopleService.toggleFollow(9, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "people");
    if (this.activeTab==0) {
      this.peoplesFollowing[i].followStatus = toFollow;
      this.streamPeopleFollowingFollow[i] = 0;
    } else if (this.activeTab==1) {
      this.peoplesFollowers[i].followStatus = toFollow;
      this.streamPeopleFollowersFollow[i] = 0;
    } else if (this.activeTab==2) {
      this.peoplesCoauthors[i].followStatus = toFollow;
      this.streamPeopleCoauthorsFollow[i] = 0;
    }
  }

  peopleMessage(i: number) {
    let userMessage: People;

    if (this.activeTab==0) {
      userMessage = this.peoplesFollowing[i];
    } else if (this.activeTab==1) {
      userMessage = this.peoplesFollowers[i];
    } else if (this.activeTab==2) {
      userMessage = this.peoplesCoauthors[i];
    }

    this.userService.newChannel = {
                                 _id: null,
                                 block: 0,
                                 usersIds: [userMessage._id],
                                 users: [userMessage],
                                 unread: 0,
                                 type: 0,
                                 message: {_id: null,
                                           type: null,
                                           userId: null,
                                           text: null,
                                           file: null,
                                           date: null
                                          }
                                };

    this._router.navigate(['/messages']);
  }

}
