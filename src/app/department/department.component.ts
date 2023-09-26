import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, NavigationEnd} from '@angular/router';
import {UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {Department, DepartmentService} from '../shared/services/department-service';
import {MissionService} from './services/mission-service';
import {UserService} from '../user/services/user-service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {AuthService} from '../auth/auth.service';

import {PublicInfo, SocialInfo, SharedService} from '../shared/services/shared-service';

import {MetaService} from '../shared/services/meta-service';

@Component({
    selector: 'department-main',
    templateUrl: 'department-main.html',
    styleUrls: ['department-main.css'],
})
export class DepartmentComponent implements OnInit, OnDestroy {
  subscriptionRouter: Subscription;

  item: Department;
  streamRetrieved: boolean = false;

  currentUrl: string = null;
  currentUrlSegments: UrlSegment[];

  infoBuildFlag: boolean = false;
  socialBuildFlag: boolean = false;

  streamPublicInfo: number;
  streamSocialInfo: number;

  private auth0Client: Auth0Client;

  constructor(public router: Router,
              public userService: UserService,
              public missionService: MissionService,
              public departmentService: DepartmentService,
              public sharedService: SharedService,
              public authService: AuthService,
              private titleService: Title,
              private metaService: MetaService) {
    this.missionService.userId = this.userService.userId;
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();

    this.authService.isAuthenticated.subscribe(value => {
      this.missionService.isAuthenticated = value
    });

    this.authService.token.subscribe(token => {
      this.missionService.showEditBtn = (this.userService.userId) ? this.authService.userHasScopes(token, ['write:departments']) : false;
    });

    this.subscriptionRouter = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavigation()
      }
      // window.scrollTo(0, 0)
    });
    this.updateNavigation()
  }

  ngOnDestroy() {
    if (this.subscriptionRouter) this.subscriptionRouter.unsubscribe();
  }

  async updateNavigation() {
    this.userService.errFlag = false;

    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;

    const newUrl = s[0].path + '/' + s[1].path;

    this.currentUrlSegments = s;

    if (this.currentUrl!=newUrl) {
      this.currentUrl = newUrl;
      this.streamRetrieved = false;

      this.item = await this.departmentService.getDepartmentByURL(newUrl);

      if (this.item && this.item._id) {

        this.missionService.departmentId = this.item._id
        this.missionService.departmentType = this.item.type
        this.missionService.departmentStage = this.item.stage;
        this.missionService.departmentIndex = this.item.departmentIndex;
        this.missionService.departmentTitle = this.item.departmentIndex.department.name + ' ' +
                                              this.item.departmentIndex.university.name + ' - Academig'

        this.missionService.departmentCounters = this.item.counters;
        this.missionService.departmentPics = this.item.pics ? this.item.pics : [];

        this.missionService.departmentLocation = this.item.location ? this.item.location : [null,null];
        this.missionService.departmentCountry = this.item.country;
        this.missionService.departmentState = this.item.state;
        this.missionService.departmentCity = this.item.city;

        this.missionService.departmentExternalLink = this.item.externalLink;
        this.missionService.departmentDescription = this.item.description;
        this.missionService.departmentSource = this.item.source;

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

        this.titleService.setTitle(this.item.departmentIndex.department.name + ' | Academig');
        this.metaService.addMetaTags(this.item.description ? this.item.description.slice(0,160) : null, null, this.item.departmentIndex.department.name);

      } else {

        this.missionService.departmentId = null;
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

    await this.sharedService.postPublicInfo(this.missionService.publicInfo, 2, this.missionService.departmentId);

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

    await this.sharedService.postSocialInfo(this.missionService.socialInfo, 2, this.missionService.departmentId);

    this.streamSocialInfo = 1;
  }

}
