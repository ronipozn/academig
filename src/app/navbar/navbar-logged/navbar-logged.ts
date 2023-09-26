import { Component, Input, Output, ViewChild, EventEmitter, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {AuthService} from '../../auth/auth.service';

import {InviteService} from '../../shared/services/invite-service';
import {PositionMini} from '../../shared/services/people-service';
import {News, NewsService} from '../../shared/services/news-service';
import {SharedService} from '../../shared/services/shared-service';
import {SettingsService} from '../../shared/services/settings-service';

import {UserService} from '../../user/services/user-service';

@Component({
  selector: 'navbar-app-logged',
  templateUrl: './navbar-logged.html',
  styleUrls: ['./navbar-logged.css']
})
export class AppNavbarLoggedComponent implements OnInit {
  @Input() unseen: number;
  @Input() unread: number;
  @Input() userName: string;
  @Input() userPic: string;
  @Input() adminFlag: boolean;
  @Input() planNumber: number;

  @ViewChild('toggleColleaguesModal', { static: true }) toggleColleagues: ElementRef;
  @ViewChild('toggleDomainProfileModal', { static: true }) toggleDomain: ElementRef;

  searchTypes: string[] = ["Labs", "Researchers", "Publications", "Trends", "Podcasts", "Apps"];
  searchText: string;
  // searchSelected: number = 0;

  inviteFlag: number;
  formModel: FormGroup;
  errorFlag: boolean[] = [false, false];

  streamNotificationsRetrieved: boolean = false;
  notifications: News[] = [];

  // filteredUserPositions: PositionMini[] = [];

  private auth0Client: Auth0Client;

  mobile_menu_visible: any = 0;
  private toggleButton: any;
  private sidebarVisible: boolean;

  streamDomainRetrieved: boolean = true;

  constructor(public userService: UserService,
              private sharedService: SharedService,
              private settingsService: SettingsService,
              private element: ElementRef,
              public router: Router,
              public authService: AuthService,
              public invitService: InviteService,
              public newsService: NewsService) {
    this.sidebarVisible = false;

    this.formModel = new FormGroup({
      email: new FormControl('', Validators.required),
      message: new FormControl('', Validators.required),
    });
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();

    // this.filteredUserPositions = this.userService.userPositions.filter(r=>r.status<8);

    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
    this.router.events.subscribe((event) => {
      this.sidebarClose();
       var $layer: any = document.getElementsByClassName('close-layer')[0];
       if ($layer) {
         $layer.remove();
         this.mobile_menu_visible = 0;
       }
   });
  }

  async getNotifications() {
    this.notifications = [];

    this.streamNotificationsRetrieved = false;

    const notifications = await this.newsService.getNews(4, 0, null);

    if (notifications) {
      this.notifications.push.apply(this.notifications, notifications);
      this.streamNotificationsRetrieved = true;
    }

    this.userService.userUnseen = 0;
  }

  searchKeyUpOp(query: string) {
    this.searchText = query;
  }

  searchFocusOp() {
    // if (this.router.url.slice(0,7)!='/search')
    this.userService.searchFocus = true;
  }

  onSearch() {
    // if (this.searchText) {
     // && this.searchSelected!=this.userService.searchSelected
    // if (this.router.url!='/search') {
      this.userService.searchText = this.searchText;
      // this.userService.searchSelected = this.searchSelected;
      this.router.navigate(['./search']);
      this.userService.searchFocus = false;
    // }
  }

  async sendInvite() {
    if (this.formModel.valid) {
      this.inviteFlag = 1;
      await this.invitService.colleagueInvite(this.formModel.value.email, this.formModel.value.message);
      this.inviteFlag = 0;
      this.formModel.controls['email'].setValue('');
      this.formModel.controls['message'].setValue('');
      this.toggleColleagues.nativeElement.click();
    }

    this.inviteFlag = 1;
  }

  buildWebsiteFunc() {
    this.userService.buildScratchWebsiteFlag = true;
    this.router.navigate(['/build']);
  }

  // https://stackoverflow.com/questions/50521494/angular-2-routing-navigate-run-in-new-tabuse-angular-router-naviagte
  pricingClick(type: number) {
    // if (type==0) {
    //   this.router.navigate(['/pricing'], { fragment: 'researchers' });
    // } else {
    // if (type==1) {
    //   this.router.navigate([]).then(result => { window.open('/pricing#labs', '_blank'); });
    // } else if (type==2) {
    //   this.router.navigate([]).then(result => { window.open('/pricing#companies', '_blank'); });
    // } else if (type==3) {
    //   this.router.navigate([]).then(result => { window.open('/pricing#departments', '_blank'); });
    // }
  }

  logout() {
    this.auth0Client.logout({
      client_id: this.authService.config.client_id,
      returnTo: window.location.origin
    });
  }

  onInviteClick(i: number): void {
    this.errorFlag[i] = false;
  }

  togglePreviewEmail(popover) {
    if (popover.isOpen()) {
      popover.close();
    } else {
      popover.open();
    }
  }

  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    setTimeout(function(){
        toggleButton.classList.add('toggled');
    }, 500);

    body.classList.add('nav-open');

    this.sidebarVisible = true;
  };

  sidebarClose() {
    const body = document.getElementsByTagName('body')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    body.classList.remove('nav-open');
  };

  sidebarToggle() {
    // const toggleButton = this.toggleButton;
    // const body = document.getElementsByTagName('body')[0];
    var $toggle = document.getElementsByClassName('navbar-toggler')[0];

    if (this.sidebarVisible === false) {
        this.sidebarOpen();
    } else {
        this.sidebarClose();
    }
    const body = document.getElementsByTagName('body')[0];

    if (this.mobile_menu_visible == 1) {
        // $('html').removeClass('nav-open');
        body.classList.remove('nav-open');
        if ($layer) {
            $layer.remove();
        }
        setTimeout(function() {
            $toggle.classList.remove('toggled');
        }, 400);

        this.mobile_menu_visible = 0;
    } else {
        setTimeout(function() {
            $toggle.classList.add('toggled');
        }, 430);

        var $layer = document.createElement('div');
        $layer.setAttribute('class', 'close-layer');


        if (body.querySelectorAll('.main-panel')) {
            document.getElementsByClassName('main-panel')[0].appendChild($layer);
        }else if (body.classList.contains('off-canvas-sidebar')) {
            document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
        }

        setTimeout(function() {
            $layer.classList.add('visible');
        }, 100);

        $layer.onclick = function() { //asign a function
          body.classList.remove('nav-open');
          this.mobile_menu_visible = 0;
          $layer.classList.remove('visible');
          setTimeout(function() {
              $layer.remove();
              $toggle.classList.remove('toggled');
          }, 400);
        }.bind(this);

        body.classList.add('nav-open');
        this.mobile_menu_visible = 1;

    }
  };

  async btnDomainFunc() {
    this.streamDomainRetrieved = false;

    await this.sharedService.putDomain(null, 1);

    this.streamDomainRetrieved = true;
    this.userService.userDomain = 1;
    this.toggleDomain.nativeElement.click();
  }

  async planUpdate(type: number) {
    const mode: number = 0; // User / Lab / Company / Department
    // const type: number = 1; // Free / PRO / PRO Mentor
    const period: number = 0; // Monthly / Yearly
    const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, null);
    stripe.redirectToCheckout({
      sessionId: plan.id
    }).then(function (result) {});
  }

  // getTitle(){
  //   var titlee = this.location.prepareExternalUrl(this.location.path());
  //   if(titlee.charAt(0) === '#'){
  //       titlee = titlee.slice( 1 );
  //   }
  //
  //   for(var item = 0; item < this.listTitles.length; item++){
  //       if(this.listTitles[item].path === titlee){
  //           return this.listTitles[item].title;
  //       }
  //   }
  //   return 'Dashboard';
  // }

}
