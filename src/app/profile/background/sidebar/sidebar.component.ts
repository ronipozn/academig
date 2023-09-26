import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';

import {Profile, People, PeopleService} from '../../../shared/services/people-service';
import {objectMini, groupComplex, SharedService} from '../../../shared/services/shared-service';
import {GroupCompareMini, Group, GroupService} from '../../../shared/services/group-service';

import {MissionService} from '../../services/mission-service';
import {UserService} from '../../../user/services/user-service';
import {SettingsService} from '../../../shared/services/settings-service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'profile-sidebar',
  templateUrl: 'sidebar.html',
  styleUrls: ['sidebar.css']
})
export class SidebarComponent {
  @Input() userId: string;
  @Input() profile: Profile;

  twitterBuildFlag: boolean = false;

  peoplesFollowing: People[] = [];
  peoplesFollowers: People[] = [];
  peoplesCoauthors: People[] = [];
  peoplesDummyCoauthors: objectMini[] = [];

  groupsFollowing: Group[] = [];

  streamPeopleFollowing: number[] = [];
  streamPeopleFollowers: number[] = [];
  streamPeopleCoauthors: number[] = [];
  streamPeopleDummyCoauthors: number[] = [];

  followingLength: number;
  followersLength: number;
  coauthorsLength: number;
  dummyCoauthorsLength: number;

  streamGroupFollowing: number[];
  streamGroupFollowed: number[];
  streamGroupFollowingCompare: number[];
  compareFollowingStatuses: boolean[] = [];
  streamGroupAdminFollowing: number[][];

  streamRetrieved: boolean[] = [];

  private auth0Client: Auth0Client;

  // @ViewChild('scrollInterests', { static: false }) private scrollInterests: ElementRef;

  constructor(private peopleService: PeopleService,
              private groupService: GroupService,
              private sharedService: SharedService,
              public userService: UserService,
              private settingsService: SettingsService,
              public missionService: MissionService,
              private authService: AuthService,
              private route: ActivatedRoute,
              private _router: Router) {}

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
    this.streamRetrieved = [false, false, false, false, false, false];
    this.peoplesFollowingFunc(0);
    this.peoplesFollowingFunc(1);
    this.peoplesFollowingFunc(2);
    this.groupsFollowingFunc();
  }

  async groupsFollowingFunc() {
    const data = await this.groupService.getGroups(11, this.missionService.peopleId, this.missionService.peopleId, 0);
    this.groupsFollowing = data;

    const adminGroupsLength = this.userService.userPositions.length;

    this.streamRetrieved[5] = true;
    this.streamGroupFollowing = new Array(this.groupsFollowing.length).fill(0);
    this.streamGroupFollowingCompare = new Array(this.groupsFollowing.length).fill(0);
    this.streamGroupAdminFollowing = Array(this.groupsFollowing.length).fill(0).map(() => new Array(adminGroupsLength).fill(0));
    this.compareFollowingStatuses = this.groupsFollowing.map(r => this.userService.userCompareGroups.map(u => u.groupIndex.group._id).indexOf(r._id)>-1);
  }

  async peoplesFollowingFunc(tabNum: number) {
    const getMode: number[] = [8, 5, 9];

    if (this.streamRetrieved[tabNum+1] == false) {

      const data = await this.peopleService.getPeoples(getMode[tabNum], this.missionService.peopleId, null, (tabNum==2) ? 1 : 9, 0);

      this.streamRetrieved[tabNum+1] = true;

      if (tabNum == 0) {
        this.peoplesFollowing = data;
        this.followingLength=this.peoplesFollowing.length;
        this.missionService.followingLength = this.followingLength;
        this.streamPeopleFollowing = new Array(this.peoplesFollowing.length).fill(0);
      } else if (tabNum == 1) {
        this.peoplesFollowers = data;
        this.followersLength=this.peoplesFollowers.length;
        this.missionService.followersLength = this.followersLength;
        this.streamPeopleFollowers = new Array(this.peoplesFollowers.length).fill(0);
      } else if (tabNum == 2) {
        this.peoplesCoauthors = data;
        this.coauthorsLength=this.peoplesCoauthors.length;
        this.missionService.coauthorsLength = this.coauthorsLength;
        this.streamPeopleCoauthors = new Array(this.peoplesCoauthors.length).fill(0);
      }
      // groupFollowing

    }

    if (tabNum==2 && this.streamRetrieved[4]==false) {

      this.peoplesDummyCoauthors = await this.sharedService.getCoAuthors(1, this.missionService.peopleId);

      this.streamRetrieved[4] = true;
      this.dummyCoauthorsLength=this.peoplesDummyCoauthors.length;
      this.missionService.dummyCoauthorsLength = this.dummyCoauthorsLength;
      this.streamPeopleDummyCoauthors = new Array(this.peoplesDummyCoauthors.length).fill(0);

    }
  }

  async twitterOp(mode: number, flag: boolean, event) {
    this.twitterBuildFlag = flag;

    if (mode == 2) {
      this.missionService.socialInfo.twitter = event.text;
      await this.sharedService.updateTwitter(1, null, event.text);
    }
  }

  networkFunc(tab: number) {
    this.missionService.activeTab = tab;
  }

  async login() {
    await this.auth0Client.loginWithRedirect({
      redirect_uri: `${window.location.origin}/callback`
      // appState: { target: this.router.url }
    });
  }

  async planUpdate() {
    const mode: number = 0; // User / Lab / Company / Department
    const type: number = 1; // Free / PRO / PRO+
    const period: number = 0; // Monthly / Yearly

    const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, null);

    stripe.redirectToCheckout({sessionId: plan.id}).then(function(result) {});
  }

}
