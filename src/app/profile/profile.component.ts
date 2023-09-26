import {Component, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';
import {Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AdminService} from '../shared/services/admin-service';

import {MissionService} from './services/mission-service';

import {UserService} from '../user/services/user-service';
import {AuthService} from '../auth/auth.service';

import {People, ProfileBasic, PeopleService} from '../shared/services/people-service';
import {objectMini, PublicInfo, SocialInfo, SharedService} from '../shared/services/shared-service';

import {MetaService} from '../shared/services/meta-service';
import {JoyrideService} from 'ngx-joyride';

import * as moment from 'moment';

@Component({
    selector: 'profile',
    templateUrl: 'profile.html',
    styleUrls: ['profile.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  subscriptionRouter: Subscription;

  streamRetrieved: boolean;

  realFlag: boolean;

  profileBasic: ProfileBasic;

  currentUrl: string = null;
  currentUrlSegments: UrlSegment[];

  picBuildFlag: boolean = false;
  nameBuildFlag: boolean = false;
  infoBuildFlag: boolean = false;
  socialBuildFlag: boolean = false;
  marketingBuildFlag: boolean = false;

  adminFlag: boolean = false;

  streamPic: number = 0;
  streamName: number = 0;
  streamFollow: number = 0;
  streamBlock: number = 0;
  streamPublicInfo: number;
  streamSocialInfo: number;
  streamMarketingRetrieved: boolean = true;

  action: string;

  reportItem: objectMini = {"_id": null, "name": null, "pic": null};

  @ViewChild('toggleNavbarSignUpModal', { static: true }) toggleNavbarSignUp: ElementRef;
  @ViewChild('toggleReportModal', { static: true }) toggleReport: ElementRef;

  constructor(private titleService: Title,
              private router: Router,
              private authService: AuthService,
              private metaService: MetaService,
              private readonly joyrideService: JoyrideService,
              public adminService: AdminService,
              public peopleService: PeopleService,
              public userService: UserService,
              public sharedService: SharedService,
              public missionService: MissionService) {}

  ngOnInit() {
    this.subscriptionRouter = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavigation()
      }
    });
    this.updateNavigation()

    // this.joyrideService.startTour(
    //   // { steps: ['peopleStep', 'jobsStep', 'newsStep', 'suggestionsStep', 'toolsStep', 'eyeStep']}
    //   { steps: ['peopleStep']}
    // );
    // setTimeout(() => {
    //   try {
    //     this.viewportScroller.scrollToPosition([0, 0]);
    //     // this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
    //   } catch (e) { }
    // }, 1);
  }

  async updateNavigation() {
    this.userService.errFlag = false;

    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;

    const newUrl: string = s[0].path + '/' + s[1].path;
    const peopleId: string = s[1].path;
    const type: number = 0;

    this.currentUrlSegments = s;

    if (this.currentUrl != newUrl) {

      this.currentUrl = newUrl;
      this.streamRetrieved = false;
      this.missionService.meFlag = false;
      this.missionService.peopleId = null;
      this.missionService.previewStatus = 0;

      if (this.streamRetrieved == false) {

        const profile: ProfileBasic = await this.peopleService.getProfileByURL(peopleId, newUrl, type);

        if (profile) {

          this.profileBasic = profile;

          this.streamRetrieved = true
          this.missionService.followStatus = this.profileBasic.followStatus;
          this.missionService.blockStatus = this.profileBasic.blockStatus;

          this.realFlag = this.profileBasic.flag;

          this.missionService.planNumber = this.profileBasic.plan;
          if (this.profileBasic.userPlan) {
            this.missionService.planStatus = this.profileBasic.userPlan.status;
            this.missionService.planTrialEnd = moment.unix(this.profileBasic.userPlan.trial_end).toDate();
          };

          if (this.profileBasic.marketing==null) {
            this.profileBasic.marketing = {
              counter: 0,
              url: null,
              text: null,
              pics: null,
              dates: null,
              user: null
            };
          }

          this.reportItem = {
            "_id": peopleId,
            "name": this.profileBasic.name,
            "pic": this.profileBasic.pic,
          }

          this.missionService.peopleId = peopleId;
          this.missionService.peopleName = this.profileBasic.name;
          this.missionService.peoplePic = this.profileBasic.pic;
          this.missionService.peopleCoverPic = this.profileBasic.coverPic;
          this.missionService.peoplePositions = this.profileBasic.positions;
          this.missionService.peopleNames = this.profileBasic.names || [];

          this.missionService.meFlag = (this.userService.userId == this.profileBasic._id);
          this.missionService.previewStatus = 0;

          this.authService.token.subscribe(token => this.adminFlag = (this.realFlag==false && this.authService.userHasScopes(token, ['write:publications'])));

          this.missionService.publicInfo = this.profileBasic.publicInfo;
          this.missionService.socialInfo = this.profileBasic.socialInfo;

          this.missionService.progress = this.profileBasic.progress;

          this.titleService.setTitle(this.profileBasic.name + ' | Academig');
          this.metaService.addMetaTags(profile.background ? profile.background.slice(0,160) : null, profile.interests ? profile.interests.toString() : null, profile.name);

        } else {

          this.profileBasic = null;
          this.streamRetrieved = true;
          this.userService.errFlag = true;

        }

      }
    }

  }

  ngOnDestroy() {
    if (this.subscriptionRouter) this.subscriptionRouter.unsubscribe();
  }

  marketingSlide(flag: boolean) {
    this.marketingBuildFlag = flag;
  }

  async marketingUpdate(event) {
    this.streamMarketingRetrieved = false;
    this.marketingBuildFlag = false;

    this.profileBasic.marketing.text = event.text;
    this.profileBasic.marketing.counter += 1;

    await this.adminService.postMarketing(this.missionService.peopleId, event.text, 0);

    this.streamMarketingRetrieved=true;
  }

  publicInfoSlide(flag: boolean) {
    this.infoBuildFlag = flag;
  }

  socialInfoSlide(flag: boolean) {
    this.socialBuildFlag = flag;
  }

  publicInfoDone() {
    this.streamPublicInfo = 0;
  }

  socialInfoDone() {
    this.streamSocialInfo = 0;
  }

  async publicInfoUpdate(event) {
    this.infoBuildFlag = false;

    this.missionService.publicInfo = {address: event.address,
                                      email: event.email,
                                      phone: event.phone,
                                      fax: event.fax,
                                      website: event.website};

    this.streamPublicInfo = 3;

    await this.sharedService.postPublicInfo(this.missionService.publicInfo, 1, this.missionService.peopleId);

    this.streamPublicInfo = 1;
  }

  async socialInfoUpdate(event) {
    this.socialBuildFlag = false;

    this.missionService.socialInfo = {linkedin: event.linkedin,
                                      twitter: event.twitter,
                                      scholar: event.scholar,
                                      orcid: event.orcid,
                                      github: event.github,
                                      researchgate: event.researchgate,
                                      facebook: event.facebook,
                                      youtube: event.youtube,
                                      pinterest: event.pinterest,
                                      instagram: event.instagram};

    this.streamSocialInfo = 3;

    await this.sharedService.postSocialInfo(this.missionService.socialInfo, 1, this.missionService.peopleId);

    this.streamSocialInfo = 1;
  }

  changeUserStatusDummyFunc() {
    if (this.missionService.meFlag) {
      this.missionService.meFlag = false;
      this.missionService.previewStatus = 1;
      this.missionService.showEditBtn = false;
      this.missionService.showHeadline = false;
    } else {
      this.missionService.meFlag = true;
      this.missionService.previewStatus = 0;
      this.missionService.showEditBtn = true;
      this.missionService.showHeadline = true;
    }
    this.router.navigate([this.currentUrl]);
  }

  profileMessage() {
    if (this.userService.userId) {
      this.userService.newChannel =
        {
         _id: null,
         block: 0,
         usersIds: [this.profileBasic._id],
         users: [{_id: this.profileBasic._id,
                  name: this.profileBasic.name,
                  stage: 2,
                  pic: this.profileBasic.pic,
                  progress: this.profileBasic.progress,
                  email: null, // this.profile.publicInfo.email,
                  positions: null, // this.profileBasic.positions,
                  followStatus: this.missionService.followStatus,
                  views: null,
                  followedSize: null,
                  publicationsSize: null,
                  currentSize: null,
                  quote: null,
                  currentReading: null
                }],
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
      this.router.navigate(['/messages']);
    } else {
      this.action = "message";
      this.toggleNavbarSignUp.nativeElement.click();
    }
  };

  async profileFollow() {
    if (this.userService.userId) {
      const itemId: string = this.missionService.peopleId;
      const toFollow: boolean = !this.missionService.followStatus;
      this.streamFollow = 3;
      await this.peopleService.toggleFollow(9, 0, itemId, toFollow);
      this.userService.toggleFollow(toFollow, itemId, "people");
      this.streamFollow = 0;
      this.missionService.followStatus = toFollow;
    } else {
      this.action = "follow";
      this.toggleNavbarSignUp.nativeElement.click();
    }
  }

  async profileBlock() {
    if (this.userService.userId) {

      const itemId: string = this.missionService.peopleId;
      const toBlock: boolean = !this.missionService.blockStatus;

      this.streamBlock = 3;

      await this.peopleService.toggleBlock(itemId, toBlock);

      this.streamBlock = 0;
      this.missionService.blockStatus = toBlock;

    } else {

      this.action = "block";
      this.toggleNavbarSignUp.nativeElement.click();

    }
  }

  profileReport() {
    if (this.userService.userId) {
      this.toggleReport.nativeElement.click();
    } else {
      this.action = "report";
      this.toggleNavbarSignUp.nativeElement.click();
    }
  }

  async profilePic(mode: number, flag: boolean, event) {
    this.picBuildFlag = flag;
    if (mode == 1) {

      this.streamPic = 3;
      await this.sharedService.deletePic(0, this.missionService.peopleId);
      this.missionService.peoplePic = null,
      this.streamPic = 0,
      this.userService.userProgress[0] = false;

    } else if (mode == 2) {

      this.userService.userPic = event;
      this.missionService.peoplePic = event;
      this.streamPic = 3;
      await this.sharedService.postPic(0, this.missionService.peopleId, [event]);
      this.streamPic = 1,
      this.userService.userProgress[0] = true;

    } else if (mode == 3) {

      this.streamPic = 0;

    }
  }

  async profileName(mode: number, flag: boolean, event) {
    this.nameBuildFlag = flag;
    this.streamName = 0;

    if (mode == 2) {
      this.userService.userName = event.text;
      this.missionService.peopleName = event.text;
      this.streamName = 3;
      await this.sharedService.updateTitle(3, null, null, event.text);
      this.streamName = 1;
    }
  }

}
