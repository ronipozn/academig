import {Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';

import {MissionService} from '../../services/mission-service';
import {Group, GroupService} from '../../../shared/services/group-service';
import {CollaborationService, Collaboration} from '../../../shared/services/collaboration-service';
import {People, PeopleService} from '../../../shared/services/people-service';

import {UserService} from '../../../user/services/user-service';
import {SharedService, objectMini} from '../../../shared/services/shared-service';
import {SettingsService} from '../../../shared/services/settings-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-sidebar',
  templateUrl: 'sidebar.html',
  styleUrls: ['sidebar.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupSidebarComponent implements OnInit {
  @Input() userId: string;

  @Output() groupFollowersUpdate: EventEmitter <number> = new EventEmitter();
  @Output() peopleFollowingsUpdate: EventEmitter <number> = new EventEmitter();
  @Output() buttonClaimClick: EventEmitter <boolean> = new EventEmitter();

  streamRetrieved: boolean[] = [];

  twitterBuildFlag: boolean = false;

  peoplesFollowed: People[] = [];
  // peoplesCoauthors: People[] = [];
  // peoplesDummyCoauthors: objectMini[] = [];
  collaborations: Group[];

  groupsFollowing: Group[] = [];
  groupsFollowed: Group[] = [];

  compareFollowingStatuses: boolean[] = [];
  compareFollowedStatuses: boolean[] = [];

  streamFollowing: number[];
  streamFollowed: number[];

  streamAdminFollowing: number[][];
  streamAdminFollowed: number[][];

  streamPeople: number[];
  // streamPeopleCoauthors: number[] = [];
  // streamPeopleDummyCoauthors: number[] = [];

  streamCollaborations: number[];
  streamCollaborationsFollow: number[];
  streamCollaborationsAdminFollow: number[][];

  groupsFollowingLength: number;
  groupsFollowersLength: number;
  peoplesFollowingLength: number;
  // peoplesCoauthorsLength: number;
  // dummyCoauthorsLength: number;

  planName: string[] = ['Free', 'PRO', 'PRO+'];
  planIcon: string[] = ['star-o', 'diamond', 'trophy'];
  // [planStatus]=missionService.planStatus
  // [planTrialEnd]=missionService.planTrialEnd

  constructor(private groupService: GroupService,
              private peopleService: PeopleService,
              private collaborationService: CollaborationService,
              public userService: UserService,
              public missionService: MissionService,
              public settingsService: SettingsService,
              private sharedService: SharedService) {}

  ngOnInit() {
    this.streamRetrieved = [false, false, false, false, false, false, false, false, false];

    this.groupsFollowingFunc(0);
    this.groupsFollowingFunc(1);
    this.peoplesFolowingFunc(true);
    // this.peoplesFolowingFunc(false);
    this.collaborationsFunc();
  }

  async groupsFollowingFunc(tabNum: number) {
    if (this.streamRetrieved[tabNum+1] == false) {

      const data = await this.groupService.getGroups(2, this.missionService.groupId, this.userId, tabNum);

      const adminGroupsLength = this.userService.userPositions ? this.userService.userPositions.length : 0;

      if (tabNum == 0) {

        this.groupsFollowing = data;

        this.groupsFollowingLength=this.groupsFollowing.length;
        this.groupsFollowing.slice(0,5);
        this.streamFollowing = new Array(this.groupsFollowing.length).fill(0);
        this.streamAdminFollowing = Array(this.groupsFollowing.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
        this.compareFollowingStatuses = new Array(this.groupsFollowing.length).fill(false);


      } else if (tabNum == 1) {

        this.groupsFollowed = data;

        this.groupsFollowersLength=this.groupsFollowed.length;
        this.groupFollowersUpdate.emit(this.groupsFollowed.length)

        this.groupsFollowed.slice(0,5);
        this.streamFollowed = new Array(this.groupsFollowed.length).fill(0);
        this.streamAdminFollowed = Array(this.groupsFollowed.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
        this.compareFollowedStatuses = new Array(this.groupsFollowing.length).fill(false);
      }

      this.streamRetrieved[tabNum+1] = true;
    }
  }

  async peoplesFolowingFunc(mode: boolean) {
    if (this.streamRetrieved[(mode) ? 3 : 5] == false) {

      const data = await this.peopleService.getPeoples((mode) ? 5 : 9, this.missionService.groupId, null, 4, 0);

      if (mode) {
        this.peoplesFollowed = data;
        this.peoplesFollowingLength=this.peoplesFollowed.length;
        this.peopleFollowingsUpdate.emit(this.peoplesFollowed.length)
        this.streamPeople = new Array(this.peoplesFollowed.length).fill(0);
      } else {
        // this.peoplesCoauthors = data;
        // this.peoplesCoauthorsLength=this.peoplesCoauthors.length;
        // this.streamPeopleCoauthors = new Array(this.peoplesCoauthors.length).fill(0);
      }

      this.streamRetrieved[(mode) ? 3 : 5] = true;

    }

    // if (mode==false && this.streamRetrieved[6]==false) {
    //
    //   this.peoplesDummyCoauthors = await this.sharedService.getCoAuthors(0, this.missionService.groupId);
    //   this.dummyCoauthorsLength=this.peoplesDummyCoauthors.length;
    //   this.streamPeopleDummyCoauthors = new Array(this.peoplesDummyCoauthors.length).fill(0);
    //   this.streamRetrieved[6] = true;
    //
    // }
  }

  async collaborationsFunc() {
    this.collaborations = await this.collaborationService.getCollaborations(this.missionService.groupId, 0, 0);

    const adminGroupsLength = this.userService.userPositions ? this.userService.userPositions.length : 0;

    this.streamRetrieved[4] = true;
    this.streamCollaborations = new Array(this.collaborations.length).fill(0);
    this.streamCollaborationsFollow = new Array(this.collaborations.length).fill(0);
    this.streamCollaborationsAdminFollow = Array(this.collaborations.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
  }

  networkFunc(tab: number) {
    this.missionService.activeTab = tab;
  }

  buttonClaimFunc() {
    this.buttonClaimClick.emit(true);
  }

  async planUpdate() {
    const mode: number = 0; // User / Lab / Company / Department
    const type: number = 1; // Free / PRO / PRO+
    const period: number = 0; // Monthly / Yearly

    const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, null);

    stripe.redirectToCheckout({sessionId: plan.id}).then(function(result) {});
  }

  async twitterOp(mode: number, flag: boolean, event) {
    this.twitterBuildFlag = flag;

    if (mode == 2) {
      this.missionService.socialInfo.twitter = event.text;
      await this.sharedService.updateTwitter(0, this.missionService.groupId, event.text);
    }
  }

}
