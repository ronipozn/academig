import {Component, OnDestroy, isDevMode, HostListener} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {ViewportScroller} from '@angular/common';

import { UserService } from './user/services/user-service';
import { AuthService } from './auth/auth.service';
import { ActionsService } from './user/services/actions.service';

import {CookieService} from 'ngx-cookie';
import {NGXLogger} from 'ngx-logger';

declare const $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  subscriptionUrlType: Subscription;

  compareToggle: boolean = false;
  minimizeCompareFlag: boolean = false;

  challengeFlag: boolean = false;

  searchLinks: any[];

  initFlag: boolean = false;
  tokenFlag: boolean = false;
  adminFlag: boolean = false;

  isMobile: boolean;

  profile: any;

  constructor(private cookieService: CookieService,
              private logger: NGXLogger,
              public router: Router,
              public userService: UserService,
              public actionsService: ActionsService,
              public authService: AuthService,
              public viewportScroller: ViewportScroller) {
    this.subscriptionUrlType = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.viewportScroller.scrollToPosition([0, 0]);
        this.urlType(event.url);
      }
    })

    this.isMobile = (window.innerWidth < 991);
    this.minimizeCompareFlag = Number(this.getCookie("compare")) ? true : false;
    this.challengeFlag = Number(this.getCookie("challengebanner")) ? false : true;

    this.searchLinks = [
      {
          label: 'Institutes',
          link: 'institutes',
          icon: 'account_balance',
      }, {
          label: 'Labs',
          link: 'labs',
          icon: 'supervised_user_circle',
      }, {
          label: 'Companies',
          link: 'companies',
          icon: 'build',
      }, {
          label: 'Researchers',
          link: 'researchers',
          icon: 'face',
      }, {
          label: 'Services',
          link: 'services',
          icon: 'construction'
      // }, {
      //     label: 'Mentors',
      //     link: 'mentors',
      //     icon: 'hearing'
      }, {
          label: 'Trends',
          link: 'trends',
          icon: 'trending_up',
      }, {
          label: 'Podcasts',
          link: 'podcasts',
          icon: 'graphic_eq',
      }, {
          label: 'Events',
          link: 'events',
          icon: 'event',
      }, {
          label: 'Apps',
          link: 'apps',
          icon: 'computer',
      }, {
          label: 'Papers Kits',
          link: 'papers-kits',
          icon: 'bookmark',
      // }, {
      //     label: 'Publications',
      //     link: 'publications',
      //     icon: 'article',
      }
    ];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = (window.innerWidth < 991);
  }

  subCount: number = 0;

  async ngAfterViewInit() {
    // if (isDevMode()) console.log('Development'); else console.log('Production');
    // const obj = client.cache.cache;
    const client = await this.authService.getAuth0Client();
    // await this.delay(100);
    this.authService.isAuthenticated.subscribe(value => {
      // The false here is important (FIX)
      if (value==false) this.userService.isAuthenticated = value;
      this.logger.debug('isAuthenticated', value, this.router.url);
    });

    this.authService.profile.subscribe(profile => {
      this.profile = profile;
      if (profile) {
        if (!this.initFlag) {
          this.logger.debug('profile', profile);
          this.initFlag = true;
          this.actionsService.userData(profile, []);
        }
      }
    });

    // Watch for changes to the token data
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:publications']);
    });
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  buttonCompareFunc() {
    this.compareToggle=!this.compareToggle;
  }

  buttonSearchFunc(tab: string) {
    this.router.navigate(['/search',tab]);
    this.userService.searchFocus = false;
  }

  urlType(url: string) {
    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g ? g.segments : [];

    const s0 = s[0] ? s[0].path : null;
    const s2 = s[2] ? s[2].path : null;

     // || s0=='access_token'
    if (s0=='help' || s0=='build' || s0=='build-lab' || url == '/signup') {

      this.userService.urlType = -1;

    } else if (url == '/home' || url == '/logout' ||
               url == '/pricing-labs' || url == '/faq' ||  url == '/contact' ||
               url == '/examples' || url == '/tour' || s0=='blog' ||

               url == '/academic-job-description-template' ||
               url == '/frequently-asked-questions' ||

               url == '/about' || url == '/press' || url == '/universities' ||
               url == '/legal/policy' || url == '/legal/advertising' || url == '/legal/copyright' ||   url == '/legal/terms' ||

               url == '/success' || url == '/demo' || url == '/features' ||

               url == '/for-labs' || url == '/for-companies' || url == '/for-departments'
              ) {

      this.userService.urlType = 2;

    } else if (url == '/') {

      this.userService.urlType = 4;

    } else if (s0=='admin' || s0=='search' || s0=='settings' || s0=='relations' || s0=='news' || s0=='messages' || s0=='private' ||
               s0=='publications' || s0=='projects' || s0=='services' || s0=='jobs' ||
               s0=='my-groups' || s0=='my-following' ||
               ((s0=='researchers' || s0=='labs') && s.length==1)
              ) {

      this.userService.urlType = 0;

    } else if ((!this.userService.isAuthenticated && s0!='people') &&
               (
                 (s.length>=1 && s.length<=2) ||
                 (s.length==3 && s0!='people' && (s2=='news' || s2=='contact' || s2=='labs' || s2=='people' || s2=='publications' || s2=='projects' || s2=='services'  || s2=='teaching' || s2=='jobs' || s2=='media' || s2=='galleries'))
               )
              ) {

      this.userService.urlType = 3;

    } else {

      this.userService.urlType = 1;

    }

    // console.log('url',url,'s0',s0,'s2',s2,'s.length',s.length,'urlType',this.userService.urlType)
  }

  getCookie(key: string){
    return this.cookieService.get(key);
  }

  ngOnDestroy() {
    if (this.subscriptionUrlType) this.subscriptionUrlType.unsubscribe();
  }

}
