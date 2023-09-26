import {Component, OnInit, OnDestroy, ElementRef, ViewChild, isDevMode} from '@angular/core';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import {UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {Title} from '@angular/platform-browser';

import {Group, GroupCompareMini, GroupService} from '../shared/services/group-service';
import {AdminService} from '../shared/services/admin-service';
import {PeopleService} from '../shared/services/people-service';

import {MissionService} from './services/mission-service';

import {UserService} from '../user/services/user-service';
import {AuthService} from '../auth/auth.service';

import {PublicInfo, SocialInfo, SharedService} from '../shared/services/shared-service';

import {MetaService} from '../shared/services/meta-service';

import * as moment from 'moment';

@Component({
    selector: 'group-main',
    templateUrl: 'group-main.html',
    styleUrls: ['group-main.css'],
})
export class GroupComponent implements OnInit, OnDestroy {
  subscriptionRouter: Subscription;
  subscriptionUnCompare: Subscription;

  streamFollow: number = 0;

  streamCompare: number = 0;
  compareFlag: boolean;

  item: Group;
  streamRetrieved: boolean[] = [true, false, false, true, true, true, false];

  currentUrl: string = null;
  currentUrlSegments: UrlSegment[];

  devFlag: boolean;
  buildForYouFlag: boolean;
  visibleLinkFlag: boolean;
  labFlag: boolean;
  adminFlag: boolean;

  tourFlag: boolean = false;

  infoBuildFlag: boolean = false;
  socialBuildFlag: boolean = false;
  // marketingBuildFlag: boolean = false;

  streamPublicInfo: number;
  streamSocialInfo: number;

  streamDomainRetrieved: boolean = true;

  domainClaim: number = 0;

  contestItem: any;

  fragment: string;

  action: string;

  // @ViewChild('toggleReject') togglePIReject: ElementRef;
  // @ViewChild('toggleApprove') togglePIApprove: ElementRef;

  @ViewChild('toggleCompareModal', { static: true }) toggleCompare: ElementRef;
  @ViewChild('toggleReportModal', { static: true }) toggleReport: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  @ViewChild('toggleWelcomeModal', { static: true }) toggleWelcome: ElementRef;
  @ViewChild('togglePublishModal', { static: false }) togglePublish: ElementRef;
  @ViewChild('toggleTakeControlModal', { static: true }) toggleTakeControl: ElementRef;
  @ViewChild('toggleDomainProfileModal', { static: true }) toggleDomain: ElementRef;

  @ViewChild('scrollCover', { static: false }) private scrollCover: ElementRef;
  @ViewChild('scrollFooter', { static: false }) private scrollFooter: ElementRef;

  constructor(public router: Router,
              public activatedRoute: ActivatedRoute,
              public missionService: MissionService,
              public groupService: GroupService,
              public adminService: AdminService,
              public peopleService: PeopleService,
              public sharedService: SharedService,
              public userService: UserService,
              public authService: AuthService,
              private metaService: MetaService,
              private titleService: Title) {
    this.missionService.userId = this.userService.userId;
    this.subscriptionUnCompare = userService.searchUnCompareAnnounced$.subscribe(
      item => {
        if (this.missionService.groupId==item._id) this.compareFlag=false;
      }
    );
  }

  async ngOnInit() {
    this.authService.isAuthenticated.subscribe(value => {
      this.missionService.isAuthenticated = value
    });

    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups']);
    });

    this.devFlag = isDevMode();

    this.subscriptionRouter = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavigation()
      }
      // window.scrollTo(0, 0)
    });

    this.activatedRoute.fragment.subscribe(fragment => {
      this.fragment = fragment
      this.scrollFunc()
    });

    this.compareFlag = this.userService.userCompareGroups.map(r => r.groupIndex.group._id).indexOf(this.missionService.groupId)>-1;

    this.updateNavigation();
  }

  ngOnDestroy() {
    if (this.subscriptionRouter) this.subscriptionRouter.unsubscribe();
    if (this.subscriptionUnCompare) this.subscriptionUnCompare.unsubscribe();
  }

  async changeStageFunc(newStage: number) {
    this.streamRetrieved[0] = false;

    await this.groupService.postGroupStage(newStage, this.missionService.groupId);

    this.streamRetrieved[0] = true;

    if (newStage == 0 && this.missionService.groupStage == -1) this.toggleTakeControl.nativeElement.click();
    // if (newStage==0 && this.missionService.groupStage==1) this.toggleTakeControl.nativeElement.click();
    if (newStage == 1) this.togglePublish.nativeElement.click();

    this.missionService.groupStage = newStage;
    this.updateStage();
  }

  changeUserStatusDummyFunc() {
    if (this.missionService.userStatus >= 5) {
      this.missionService.userId = undefined;
      this.missionService.previewStatus = this.missionService.userStatus;
      this.missionService.userStatus = 2;
      this.missionService.showEditBtn = false;
      this.missionService.showHeadline = false;
    } else {
      this.missionService.userId = this.userService.userId;
      this.missionService.userStatus = this.missionService.previewStatus;
      this.missionService.previewStatus = 0;
      this.missionService.showEditBtn = true;
      this.missionService.showHeadline = true;
    }
    this.router.navigate([this.currentUrl]);
  }

  toggleModalFunc(modalNum: number) {
    if (modalNum == 0) this.toggleTakeControl.nativeElement.click();
    // if (modalNum == 1) this.togglePublish.nativeElement.click();
  }

  async changeWelcomeStageFunc(newStage: number) {
    if (this.missionService.groupStage==2) this.tourFlag = true;

    this.toggleWelcome.nativeElement.click();

    this.streamRetrieved[2] = false;
    await this.groupService.postGroupWelcomeStage(newStage, this.missionService.groupId);
    this.streamRetrieved[2] = true;

    // if (this.item.relation.status==6) { // PI pull invitation (If invited)
    //   await this.groupService.postGroupStage(10, this.missionService.groupId);
    //   if (this.userService.userInvites) this.userService.userInvites = this.userService.userInvites.filter(r => r.group.group._id! != this.missionService.groupId);
    // } else {
    //   await this.groupService.postGroupWelcomeStage(newStage, this.missionService.groupId);
    // }
    // this.streamRetrieved[2] = true;
  }

  async updateNavigation() {
    this.userService.errFlag = false;

    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;

    const newUrl = s[0].path + '/' + s[1].path + '/' + s[2].path;

    this.currentUrlSegments = s;

    if (this.currentUrl != newUrl) {

      this.currentUrl = newUrl;
      this.streamRetrieved[1] = false;

      const data: Group = await this.groupService.getGroupByURL(newUrl);

      if (data) {

        this.item = data;

        this.missionService.groupId = this.item._id;
        this.missionService.onBehalf = this.item.onBehalf;
        this.missionService.onInvite = this.item.onInvite;
        this.missionService.groupStage = this.item.stage;
        this.missionService.extScore = this.item.extScore;
        this.missionService.intScore = this.item.intScore;
        this.missionService.groupProgress = this.item.progress;
        this.missionService.followStatus = this.item.followStatus;
        this.missionService.userStatus = this.item.relation.status ? this.item.relation.status : 0;
        this.missionService.userStatusMode = this.item.relation.mode;
        this.missionService.instituteEmailVerified = this.item.relation.email_stage;
        this.missionService.groupName = this.item.groupIndex.group.name;
        this.missionService.topics = this.item.topics ? this.item.topics : [];
        this.missionService.piName = this.item.piName;
        this.missionService.piTitle = this.item.piTitle;
        this.missionService.piNames = (this.item.piNames==null || (Object.keys(this.item.piNames).length===0 && this.item.piNames.constructor===Object)) ? [] : this.item.piNames;
        // this.missionService.piNames = this.item.piNames || [];
        this.missionService.groupCoverPic = this.item.pic;
        this.missionService.breadDetailsStream = 0;
        this.missionService.groupIndex = this.item.groupIndex;
        this.missionService.groupTitle = this.item.groupIndex.group.name + ' | ' +
                                         this.item.groupIndex.university.name + ' ' +
                                         this.item.groupIndex.department.name + ' - Academig';

        this.missionService.location = this.item.location;
        this.missionService.country = this.item.country;
        this.missionService.state = this.item.state;
        this.missionService.city = this.item.city;

        this.missionService.groupType = !(this.missionService.onBehalf==4 || this.missionService.onBehalf==5 || this.missionService.onBehalf==7);
        this.missionService.groupTypeTitle = this.missionService.groupType ? "Lab" : "Company";

        this.missionService.publicInfo = this.item.publicInfo ? this.item.publicInfo : {
          address: null,
          email: null,
          phone: null,
          fax: null,
          website: null
        };
        this.missionService.socialInfo = this.item.socialInfo ?  this.item.socialInfo : {
          linkedin: null,
          twitter: null,
          scholar: null,
          orcid: null,
          github: null,
          researchgate: null,
          facebook: null,
          youtube: null,
          pinterest: null,
          instagram: null
        };

        this.missionService.planNumber = this.item.plan;
        this.missionService.buildPro = this.item.buildPro;
        // this.missionService.planStatus = this.item.userPlan.status;
        // this.missionService.planTrialEnd = moment.unix(this.item.userPlan.trial_end).toDate();

        if (this.missionService.userStatus==6 || this.missionService.userStatus==7) {
          this.domainClaim = this.item.domain;
          this.userService.buildGroupJob = {
            "_id": this.missionService.groupId,
            "userStatus": this.missionService.userStatus,
            "groupIndex": this.item.groupIndex,
            "firstName": this.item.piName,
            "topic": this.item.topic,
            "group_size": null,
            "establishDate": null
          };
          // console.log('this.userService.buildGroupJob',this.userService.buildGroupJob)
        }

        if (this.item.marketing==null) {
          this.item.marketing = {
            counter: 0,
            url: null,
            text: null,
            pics: null,
            dates: null,
            user: null
          };
        }

        this.contestItem = this.item.contest;

        // console.log('contestItem',this.contestItem)

        // if ((this.item.welcome==1 && this.item.relation.status>=6) || (this.item.onBehalf==1 && this.item.relation.status==6)) {
        if (this.item.welcome==1 && this.item.relation.status>=6) this.toggleWelcome.nativeElement.click();

        this.updateStage();

        this.titleService.setTitle(this.missionService.groupName + ' | Academig');
        this.metaService.addMetaTags(data.background ? data.background.slice(0,160) : null, data.interests ? data.interests.toString() : null, this.missionService.groupName);
        // this.metaService.getMetaTags();

      } else {

        this.missionService.groupId = null;
        this.missionService.groupStage = 0;
        this.userService.errFlag = true;
        this.missionService.showPage = false;
        this.updateStage();

      }

      this.streamRetrieved[1] = true;

    }
  }

  updateStage () {
    this.missionService.previewStatus = 0;

    this.missionService.showPage = this.missionService.groupId &&
                                   (
                                    // (this.missionService.groupStage>-1 && this.missionService.userStatus>=4)
                                    (this.missionService.userStatus>=4)
                                    ||
                                    (this.missionService.groupStage==2)
                                    ||
                                    (this.missionService.isAuthenticated && this.adminFlag)
                                   );

    this.visibleLinkFlag = this.missionService.userStatus>=4 || (((this.missionService.onBehalf!=6 && this.missionService.onBehalf!=7) || this.missionService.onInvite==1) && this.missionService.groupStage>=2);

    this.labFlag = !(this.missionService.onBehalf==4 || this.missionService.onBehalf==5 || this.missionService.onBehalf==7);

    this.buildForYouFlag = (this.missionService.groupStage==-1 && this.missionService.userStatus>=4)

    this.missionService.showEditBtn = (
                                       (this.missionService.userStatus == 5 || this.missionService.userStatus == 6 || this.missionService.userStatus == 7) && this.missionService.userStatusMode==2 &&
                                       (this.missionService.groupStage == 0 || this.missionService.groupStage == 1 || this.missionService.groupStage == 2 || this.missionService.groupStage == 7)
                                      )
                                      || (this.missionService.groupStage == -1 && (this.missionService.isAuthenticated && this.adminFlag));

    this.missionService.showHeadline = (this.missionService.userStatus == 5 || this.missionService.userStatus == 6 || this.missionService.userStatus == 7) && this.missionService.userStatusMode==2
                                       || (this.missionService.groupStage == -1 && (this.missionService.isAuthenticated && this.adminFlag));

    // console.log('groupId',this.missionService.groupId, 'showPage',this.missionService.showPage,'showEditBtn',this.missionService.showEditBtn,'groupStage',this.missionService.groupStage);
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "cover": this.scrollCover.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
           case "contact-info": this.scrollFooter.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
           case "social-info": this.scrollFooter.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
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

    await this.sharedService.postPublicInfo(this.missionService.publicInfo, 0, this.missionService.groupId);

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

    await this.sharedService.postSocialInfo(this.missionService.socialInfo, 0, this.missionService.groupId);

    this.streamSocialInfo = 1;
  }

  async btnDomainFunc() {
    this.streamDomainRetrieved = false;

    await this.sharedService.putDomain(this.missionService.groupId, 0);

    this.streamDomainRetrieved = true;
    this.domainClaim = 1;
    this.toggleDomain.nativeElement.click();
  }

  async groupFollow() {
    if (this.missionService.userId) {

      const itemId: string = this.missionService.groupId;
      const toFollow: boolean = !this.missionService.followStatus;
      this.streamFollow = 3;
      await this.peopleService.toggleFollow(4, 0, itemId, toFollow);
      this.userService.toggleFollow(toFollow, itemId, "group");
      this.missionService.followStatus = toFollow;
      this.streamFollow = 0;

    } else {

      this.action = "follow";
      this.toggleSignUp.nativeElement.click();

    }
  }

  async groupCompare() {
    const itemId: string = this.missionService.groupId;
    const compareIndex: number = this.userService.userCompareGroups.map(r => r.groupIndex.group._id).indexOf(itemId);
    const groupCompare: GroupCompareMini = {
      "_id": this.missionService.groupId,
      "pic": this.missionService.groupCoverPic,
      "groupIndex": this.missionService.groupIndex,
      "country": this.missionService.country,
      "city": this.missionService.city,
    }

    if (this.missionService.isAuthenticated) {

      if (this.compareFlag || this.userService.userCompareGroups.length<5) {

        if (this.compareFlag) {
          if (compareIndex > -1) this.userService.userCompareGroups.splice(compareIndex, 1);
        } else {
          this.userService.userCompareGroups.push(groupCompare);
        }

        this.streamCompare = 3;

        await this.peopleService.toggleFollow(12, 0, itemId, !this.compareFlag);

        this.compareFlag = !this.compareFlag;
        this.streamCompare = 0;

      } else {

        this.toggleCompare.nativeElement.click();

      }

    } else {

      if (compareIndex>-1) {
        this.compareFlag = !this.compareFlag;
        this.userService.userCompareGroups.splice(compareIndex, 1);
      } else if (this.userService.userCompareGroups.length<5) {
        this.compareFlag = !this.compareFlag;
        this.userService.userCompareGroups.push(groupCompare);
      } else {
        this.toggleCompare.nativeElement.click();
      }

    }

  }

  groupReport() {
     // && this.groupStage==2
    // if (this.missionService.userId) {
      this.toggleReport.nativeElement.click();
    // } else {
      // this.action = "report";
      // this.toggleSignUp.nativeElement.click();
    // }
  }

  closeGroupReport() {
    this.toggleReport.nativeElement.click();
  }

}
