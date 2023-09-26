import {Component, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';

import {MissionService} from '../services/mission-service';
import {GroupCompareMini, Group, GroupService} from '../../shared/services/group-service';
import {UserService} from '../../user/services/user-service';
import {People, PeopleService} from '../../shared/services/people-service';
import {objectMini, SharedService} from '../../shared/services/shared-service';

import {itemsAnimation} from '../../shared/animations/index';

import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'group-network',
  templateUrl: 'network.html',
  styleUrls: ['network.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupNetworkComponent implements OnInit, OnDestroy {
  subscriptionTab: Subscription;
  subscriptionPeople: Subscription;
  subscriptionCompare: Subscription;
  subscriptionUnCompare: Subscription;

  subscriptionFollow: Subscription[] = [];
  subscriptionAdminFollow: Subscription[] = [];

  streamRetrieved: boolean[] = [false, false, false, false, false];;
  activeTab: number;

  groupsFollowing: Group[] = [];
  groupsFollowed: Group[] = [];

  compareFollowingStatuses: boolean[] = [];
  compareFollowedStatuses: boolean[] = [];

  peoples: People[];

  streamFollowing: number[];
  streamFollowed: number[];

  streamFollowingCompare: number[];
  streamFollowedCompare: number[];

  streamAdminFollowing: number[][];
  streamAdminFollowed: number[][];

  streamPeople: number[];
  streamPeopleFollow: number[];

  @ViewChild('toggleCompareModal', { static: false }) toggleCompare: ElementRef;

  constructor(public titleService: Title,
              public groupService: GroupService,
              public peopleService: PeopleService,
              public sharedService: SharedService,
              public userService: UserService,
              public missionService: MissionService,
              public _router: Router,
              public auth: AuthService) {
  }

  ngOnInit() {
    if (this.missionService.groupId && this.missionService.groupStage==2) {
      this.titleService.setTitle('Lab Network - ' + this.missionService.groupTitle + ' | Academig');

      this.streamRetrieved = [false, false, false, false, false, false];
      this.activeTab = this.missionService.activeTab;

      this.groupsFollowing = [];
      this.groupsFollowed = [];

      this.subscriptionUnCompare = this.userService.searchUnCompareAnnounced$.subscribe(
        item => {
          const compareFollowingIndex: number = (this.activeTab==0) ? this.groupsFollowing.map(r=>r._id).indexOf(item._id) : this.groupsFollowed.map(r=>r._id).indexOf(item._id);
          if (compareFollowingIndex>-1) this.compareFollowingStatuses[compareFollowingIndex]=false;

          const compareFollowedIndex: number = (this.activeTab==0) ? this.groupsFollowing.map(r=>r._id).indexOf(item._id) : this.groupsFollowed.map(r=>r._id).indexOf(item._id);
          if (compareFollowedIndex>-1) this.compareFollowedStatuses[compareFollowedIndex]=false;
      });

      this.tabFunc(this.activeTab)
    }
  }

  ngOnDestroy() {
    this.missionService.activeTab=1;
    if (this.subscriptionUnCompare) this.subscriptionUnCompare.unsubscribe();
  }

  async tabFunc(tabNum: number) {
    this.activeTab = tabNum;

    if (this.streamRetrieved[tabNum] == false) {

      if (tabNum==1 || tabNum==2) this.peoplesFunc(tabNum);

      const data = await this.groupService.getGroups(2, this.missionService.groupId, this.missionService.userId, tabNum);

      const adminGroupsLength = this.userService.userPositions.length;

      if (tabNum == 0) {

        this.groupsFollowing = data;

        this.streamFollowing = new Array(this.groupsFollowing.length).fill(0);
        this.streamFollowingCompare = new Array(this.groupsFollowing.length).fill(0);
        this.streamAdminFollowing = Array(this.groupsFollowing.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
        this.compareFollowingStatuses = this.groupsFollowing.map(r => this.userService.userCompareGroups.map(u => u.groupIndex.group._id).indexOf(r._id)>-1);

      } else if (tabNum == 1) {

        this.groupsFollowed = data;

        this.streamFollowed = new Array(this.groupsFollowed.length).fill(0);
        this.streamFollowedCompare = new Array(this.groupsFollowed.length).fill(0);
        this.streamAdminFollowed = Array(this.groupsFollowed.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
        this.compareFollowedStatuses = this.groupsFollowed.map(r => this.userService.userCompareGroups.map(u => u.groupIndex.group._id).indexOf(r._id)>-1);

      }

      this.streamRetrieved[tabNum] = true;

    }
  }

  async peoplesFunc(tabNum: number) {
    const data = await this.peopleService.getPeoples((tabNum==1) ? 5 : 9, this.missionService.groupId, null, (tabNum==1) ? 4 : 0, 0);

    if (tabNum == 1) {
      this.peoples = data;
      this.streamPeople = new Array(this.peoples.length).fill(0);
      this.streamPeopleFollow = new Array(this.peoples.length).fill(0);
      this.streamRetrieved[3] = true;
    } else if (tabNum == 2) {
      this.streamRetrieved[5] = true;
    }
  }

  async groupFollow(i: number, tabNum: number) {
    let itemId: string;
    let toFollow: boolean;
    if (tabNum == 0) {
      toFollow = !this.groupsFollowing[i].followStatus;
      itemId = this.groupsFollowing[i]._id;
      this.streamFollowing[i] = 3;
    } else if (tabNum == 1) {
      toFollow = !this.groupsFollowed[i].followStatus;
      itemId = this.groupsFollowed[i]._id;
      this.streamFollowed[i] = 3;
    };
    await this.peopleService.toggleFollow(4, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "group");
    if (tabNum == 0) {
      this.groupsFollowing[i].followStatus = toFollow;
      this.streamFollowing[i] = 0;
    } else if (tabNum == 1) {
      this.groupsFollowed[i].followStatus = toFollow;
      this.streamFollowed[i] = 0;
    };
  }

  async groupAdminFollow(index: number[], tabNum: number) {
    // index[0] - follow as
    // index[1] - group to follow

    let toFollow: boolean;

    const adminGroupId: string = this.userService.userPositions[index[0]].group.group._id;
    let groupId: string;

    if (tabNum == 0) {
      toFollow = !this.groupsFollowing[index[1]].followAdminStatus[index[0]];
      groupId = this.groupsFollowing[index[1]]._id;
      this.streamAdminFollowing[index[1]][index[0]] = 3;
    } else if (tabNum == 1) {
      toFollow = !this.groupsFollowed[index[1]].followAdminStatus[index[0]];
      groupId = this.groupsFollowed[index[1]]._id;
      this.streamAdminFollowed[index[1]][index[0]] = 3;
    };

    await this.groupService.toggleFollow(adminGroupId, groupId, toFollow);

    if (tabNum == 0) {
      this.groupsFollowing[index[1]].followAdminStatus[index[0]] = toFollow;
      this.streamAdminFollowing[index[1]][index[0]] = 0;
    } else if (tabNum == 1) {
      this.groupsFollowed[index[1]].followAdminStatus[index[0]] = toFollow;
      this.streamAdminFollowed[index[1]][index[0]] = 0;
    };

  }

  async itemCompare(i: number, tabNum: number) {
    var group: Group;
    var compareFlag: boolean;

    if (tabNum == 0) {
      group = this.groupsFollowing[i];
      compareFlag = this.compareFollowingStatuses[i];
    } else if (tabNum == 1) {
      group = this.groupsFollowed[i];
      compareFlag = this.compareFollowedStatuses[i];
    };

    const itemId: string = group._id;

    if (this.missionService.isAuthenticated) {

      if (compareFlag || this.userService.userCompareGroups.length<5) {

        if (compareFlag) {
          const compareIndex: number = this.userService.userCompareGroups.map(r => r.groupIndex.group._id).indexOf(itemId);
          if (compareIndex > -1) this.userService.userCompareGroups.splice(compareIndex, 1);
        } else {
          const groupCompare: GroupCompareMini = {
            "_id": group.groupIndex.group._id,
            "pic": group.pic,
            "groupIndex": group.groupIndex,
            "country": group.country,
            "city": group.city,
          }
          this.userService.userCompareGroups.push(groupCompare);
        }

        await this.peopleService.toggleFollow(12, 0, itemId, !compareFlag);

        if (tabNum == 0) {
          this.compareFollowingStatuses[i]=!this.compareFollowingStatuses[i];
        } else if (tabNum == 1) {
          this.compareFollowedStatuses[i]=!this.compareFollowedStatuses[i];
        };

      } else {

        this.toggleCompare.nativeElement.click();

      }

    } else {

      const compareIndex: number = this.userService.userCompareGroups.map(r => r.groupIndex.group._id).indexOf(group.groupIndex.group._id);

      if (compareIndex>-1) {

        if (tabNum == 0) {
          this.compareFollowingStatuses[i]=!this.compareFollowingStatuses[i];
        } else if (tabNum == 1) {
          this.compareFollowedStatuses[i]=!this.compareFollowedStatuses[i];
        };

        this.userService.userCompareGroups.splice(compareIndex, 1);

      } else if (this.userService.userCompareGroups.length<5) {

        if (tabNum == 0) {
          this.compareFollowingStatuses[i]=!this.compareFollowingStatuses[i];
        } else if (tabNum == 1) {
          this.compareFollowedStatuses[i]=!this.compareFollowedStatuses[i];
        };

        const groupCompare: GroupCompareMini = {
          "_id": group._id,
          "pic": group.pic,
          "groupIndex": group.groupIndex,
          "country": group.country,
          "city": group.city,
        }
        this.userService.userCompareGroups.push(groupCompare);
      } else {

        this.toggleCompare.nativeElement.click();

      }

    }
  }

  async peopleFollow(i: number) {
    const itemId: string = this.peoples[i]._id;
    const toFollow: boolean = !this.peoples[i].followStatus;
    this.streamPeopleFollow[i] = 3;
    await this.peopleService.toggleFollow(9, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "people");
    this.peoples[i].followStatus = toFollow;
    this.streamPeopleFollow[i] = 0;
  }

  peopleMessage(i: number) {
    const userMessage: People = this.peoples[i];

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
