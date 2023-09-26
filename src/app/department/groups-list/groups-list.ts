import {Component, Input, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {MissionService} from '../services/mission-service';
import {GroupCompareMini, Group, GroupService} from '../../shared/services/group-service';
import {PeopleService} from '../../shared/services/people-service';
import {UserService} from '../../user/services/user-service';

@Component({
  selector: 'department-groups-list',
  templateUrl: 'groups-list.html',
  styleUrls: ['groups-list.css']
})
export class DepartmentGroupsListComponent implements OnInit, OnDestroy {
  @Input() mode: number = 0;

  subscriptionUnCompare: Subscription;

  streamRetrieved = false;
  groups: Group[] = [];

  streamCompare: number[];
  streamFollow: number[];
  streamAdminFollow: number[][];

  compareStatuses: boolean[] = [];

  @ViewChild('toggleCompareModal', { static: false }) toggleCompare: ElementRef;

  constructor(public missionService: MissionService,
              public userService: UserService,
              public groupService: GroupService,
              public peopleService: PeopleService) {
    this.subscriptionUnCompare = userService.searchUnCompareAnnounced$.subscribe(
      item => {
        const compareIndex: number = this.groups.map(r=>r._id).indexOf(item._id);
        if (compareIndex>-1) this.compareStatuses[compareIndex]=false;
    });
  }

  async ngOnInit() {
    this.updateGroups()
  }

  async updateGroups() {
    this.streamRetrieved = false;

    const groups = await this.groupService.getGroups(1, this.missionService.departmentId, this.missionService.userId);

    this.groups = groups.filter(r => r.stage==2);

    if (this.mode==1) {
      this.groups = this.shuffleFisherYates(this.groups)
      this.groups = this.groups.slice(0,3);
    }

    const adminGroupsLength = this.userService.userPositions.length;

    this.streamRetrieved = true;
    this.streamFollow = new Array(this.groups.length).fill(0);
    this.streamCompare = new Array(this.groups.length).fill(0);
    this.streamAdminFollow = Array(this.groups.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
    this.compareStatuses = this.groups.map(r => this.userService.userCompareGroups.map(u => u.groupIndex.group._id).indexOf(r._id)>-1);
  }

  async groupFollow(i: number) {
    let itemId: string;
    let toFollow: boolean;

    toFollow = !this.groups[i].followStatus;
    itemId = this.groups[i]._id;
    this.streamFollow[i] = 3;

    await this.peopleService.toggleFollow(4, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "group");
    this.streamFollow[i] = 0;
    this.groups[i].followStatus = toFollow;
  }

  async groupAdminFollow(index: number[]) {
    // index[0] - follow as
    // index[1] - group to follow

    let toFollow: boolean;
    let groupId: string;

    const adminGroupId: string = this.userService.userPositions[index[0]].group.group._id;

    toFollow = !this.groups[index[1]].followAdminStatus[index[0]];
    groupId = this.groups[index[1]]._id;
    this.streamAdminFollow[index[1]][index[0]] = 3;

    await this.groupService.toggleFollow(adminGroupId, groupId, toFollow);

    this.groups[index[1]].followAdminStatus[index[0]] = toFollow;
    this.streamAdminFollow[index[1]][index[0]] = 0;
  }

  async itemCompare(i: number) {
    const group: Group = this.groups[i];
    const itemId: string = group._id;
    const compareFlag: boolean = this.compareStatuses[i];

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

        this.compareStatuses[i]=!this.compareStatuses[i];

      } else {

        this.toggleCompare.nativeElement.click();

      }

    } else {

      const compareIndex: number = this.userService.userCompareGroups.map(r => r.groupIndex.group._id).indexOf(group.groupIndex.group._id);

      if (compareIndex>-1) {
        this.compareStatuses[i]=!this.compareStatuses[i];
        this.userService.userCompareGroups.splice(compareIndex, 1);
      } else if (this.userService.userCompareGroups.length<5) {
        this.compareStatuses[i]=!this.compareStatuses[i];
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

  ngOnDestroy() {
    if (this.subscriptionUnCompare) this.subscriptionUnCompare.unsubscribe();
  }

  // https://stackoverflow.com/questions/49555273/how-to-shuffle-an-array-of-objects-in-javascript
  shuffleFisherYates(array) {
    let i = array.length;
    while (i--) {
      const ri = Math.floor(Math.random() * (i + 1));
      [array[i], array[ri]] = [array[ri], array[i]];
    }
    return array;
  }

}
