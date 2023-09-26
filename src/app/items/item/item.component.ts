import {Component, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, NavigationEnd} from '@angular/router';
import {UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {PublicInfo, SocialInfo, SharedService} from '../../shared/services/shared-service';
import {PeopleService} from '../../shared/services/people-service';

import {MissionService} from '../services/mission-service';
import {Item, ItemService} from '../services/item-service';
import {UserService} from '../../user/services/user-service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {AuthService} from '../../auth/auth.service';

import {MetaService} from '../../shared/services/meta-service';

@Component({
    selector: 'item-main',
    templateUrl: 'item-main.html',
    styleUrls: ['item-main.css'],
})
export class ItemComponent implements OnInit, OnDestroy {
  subscriptionRouter: Subscription;

  item: Item;
  streamRetrieved: boolean = false;
  currentUrl: string = null;

  adminFlag: boolean = false;

  infoBuildFlag: boolean = false;
  socialBuildFlag: boolean = false;

  streamPublicInfo: number;
  streamSocialInfo: number;
  streamFollow: number = 0;

  // streamCompare: number = 0;
  // compareFlag: boolean;

  action: string;

  typesNames: string[] = ['trends','podcasts','events','apps']

  private auth0Client: Auth0Client;

  // @ViewChild('toggleCompareModal', { static: true }) toggleCompare: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  constructor(public router: Router,
              public userService: UserService,
              public missionService: MissionService,
              public itemService: ItemService,
              public peopleService: PeopleService,
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
      this.adminFlag = (this.userService.userId) ? this.authService.userHasScopes(token, ['write:departments']) : false;
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

    if (this.currentUrl!=newUrl) {

      this.currentUrl = newUrl;
      this.streamRetrieved = false;

      this.item = await this.itemService.getItemByURL(newUrl);
      console.log('this.item',this.item)

      if (this.item && this.item._id) {

        this.missionService.showEditBtn = (this.item.team && this.item.team.filter(r => r._id == this.missionService.userId).length ? true : false) || this.adminFlag;

        switch (s[0].path) {
          case 'trends': this.missionService.type = 0; break;
          case 'podcasts': this.missionService.type = 1; break;
          case 'events': this.missionService.type = 2; break;
          case 'apps': this.missionService.type = 3; break;
        }

        this.missionService.stage = this.item.stage;
        // this.missionService.counters = this.item.counters;

        // this.missionService.tags = ["MARKETING", "COURSE"];
        this.missionService.followStatus = this.item.followStatus;

        this.missionService.id = this.item._id
        this.missionService.name = this.item.name
        this.missionService.link = this.item.link
        this.missionService.pic = this.item.pic

        this.missionService.location = this.item.location ? this.item.location : [null,null];
        this.missionService.country = this.item.country;
        this.missionService.state = this.item.state;
        this.missionService.city = this.item.city;

        this.missionService.team = this.item.team;

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

        this.titleService.setTitle(this.item.name + ' | Academig');
        // this.metaService.addMetaTags(this.missionService.tags);

      } else {

        this.missionService.id = null;
        this.missionService.showEditBtn = false;
        this.userService.errFlag = true;

      }

      this.streamRetrieved = true;
    }
  }

  async publicInfoUpdate(event) {
    this.infoBuildFlag = false;

    this.missionService.publicInfo = {address: event.address,
                                      email: event.email,
                                      phone: event.phone,
                                      fax: event.fax,
                                      website: event.website};

    this.streamPublicInfo = 3;
    await this.sharedService.postPublicInfo(this.missionService.publicInfo, this.missionService.type+4, this.missionService.id);
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
    await this.sharedService.postSocialInfo(this.missionService.socialInfo, this.missionService.type+4, this.missionService.id);
    this.streamSocialInfo = 1;
  }

  async itemFollow() {
    if (this.missionService.userId) {

      const itemId: string = this.item._id;
      const toFollow: boolean = !this.missionService.followStatus;
      this.streamFollow = 3;
      await this.peopleService.toggleFollow(this.missionService.type+5, 0, itemId, toFollow);
      this.userService.toggleFollow(toFollow, itemId, this.typesNames[this.missionService.type]);
      this.missionService.followStatus = toFollow;
      this.streamFollow = 0;

    } else {

      this.action = "follow";
      this.toggleSignUp.nativeElement.click();

    }
  }

}
