import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, NavigationEnd} from '@angular/router';
import {UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {University, UniversityService} from '../shared/services/university-service';
import {MissionService} from './services/mission-service';
import {UserService} from '../user/services/user-service';
import {AuthService} from '../auth/auth.service';

import {PublicInfo, SocialInfo, complexName, SharedService} from '../shared/services/shared-service';

import {MetaService} from '../shared/services/meta-service';

import {environment} from '../../environments/environment';

@Component({
    selector: 'university-main',
    templateUrl: 'university-main.html',
    styleUrls: ['university-main.css'],
})
export class UniversityComponent implements OnDestroy {
  subscriptionRouter: Subscription;

  item: University;
  streamRetrieved: boolean = false;

  currentUrl: string = null;
  currentUrlSegments: UrlSegment[];

  infoBuildFlag: boolean = false;
  socialBuildFlag: boolean = false;

  isAuthenticated: boolean;

  streamPublicInfo: number;
  streamSocialInfo: number;

  companyId: string;

  universityComplex: complexName;

  constructor(public router: Router,
              public userService: UserService,
              public missionService: MissionService,
              public universityService: UniversityService,
              public sharedService: SharedService,
              public authService: AuthService,
              private titleService: Title,
              private metaService: MetaService) {
    this.missionService.userId = this.userService.userId;
  }

  async ngOnInit() {
    this.authService.isAuthenticated.subscribe(value => {
      this.isAuthenticated = value;
    });

    this.authService.token.subscribe(token => {
      this.missionService.showEditBtn = (this.userService.userId) ? this.authService.userHasScopes(token, ['write:universities']) : false;
    });

    this.subscriptionRouter = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavigation()
      }
    });
    this.updateNavigation()

    this.companyId = environment.companyId;
  }

  async updateNavigation() {
    this.userService.errFlag = false;

    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;

    const newUrl = s[0].path;
    this.missionService.universityLink = newUrl;

    this.currentUrlSegments = s;

    if (this.currentUrl!=newUrl) {
      this.currentUrl = newUrl;
      this.streamRetrieved = false;

      this.item = await this.universityService.getUniversityByURL(newUrl);

      if (this.item) {

        this.missionService.universityId = this.item._id;
        this.missionService.universityPic = this.item.pic;
        this.missionService.universityName = this.item.name;

        this.missionService.universityCounters = this.item.counters;
        this.missionService.universityPics = this.item.pics ? this.item.pics : [];

        this.missionService.universityCountry = this.item.country;
        this.missionService.universityState = this.item.state;
        this.missionService.universityCity = this.item.city;
        this.missionService.universityLocation = this.item.location ? this.item.location : [null,null];

        this.missionService.universityExternalLink = this.item.externalLink;
        this.missionService.universityDescription = this.item.description;
        this.missionService.universitySource = this.item.source;

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

        this.universityComplex = {
          "_id": this.item._id,
          "name":this.item.name,
          "pic": this.item.pic,
          "link" : this.item.link
        }

        this.titleService.setTitle(this.item.name + ' | Academig');
        this.metaService.addMetaTags(this.item.description ? this.item.description.slice(0,160) : null, null, this.item.name);

      } else {

        this.missionService.universityId = null;
        this.userService.errFlag = true;

      }

      this.streamRetrieved = true;
    }
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

    await this.sharedService.postPublicInfo(this.missionService.publicInfo, 3, this.missionService.universityId);

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

    await this.sharedService.postSocialInfo(this.missionService.socialInfo, 3, this.missionService.universityId);

    this.streamSocialInfo = 1;
  }

  ngOnDestroy() {
    if (this.subscriptionRouter) this.subscriptionRouter.unsubscribe();
  }

}
