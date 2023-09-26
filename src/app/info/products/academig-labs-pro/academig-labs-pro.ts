import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {AuthService} from '../../../auth/auth.service';
import {UserService} from '../../../user/services/user-service';
import {SettingsService} from '../../../shared/services/settings-service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

@Component({
  selector: 'academig-labs-pro',
  templateUrl: 'academig-labs-pro.html',
  styleUrls: ['academig-labs-pro.css']
})
export class AcademigLabsProComponent implements OnInit {
  isAuthenticated: boolean;

  streamSubscribe: number = 0;

  private auth0Client: Auth0Client;

  constructor(private titleService: Title,
              private userService: UserService,
              private settingsService: SettingsService,
              public authService: AuthService) {
    this.titleService.setTitle('Labs Tools Pro | Academig');
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();

    this.authService.isAuthenticated.subscribe(value => {
      this.isAuthenticated = value
    });

    // https://stackoverflow.com/questions/46096587/call-a-function-every-10-seconds-angular2
    // this.subscriptionTitles = Observable.interval(2000).subscribe((val) => { this.switchTitles() });
  }

  stepsGroups: string[] = [
    'Lab Reports',
    // 'Lab News',
    'Existing prospecting solutions are expensive, cumbersome, and manual',
    'Lab Chat',
    'Lab Seminars',
    'Lab Assignments',
    'Lab Calendar',
    'Lab Polls',
    'Lab Papers Kit',
    'Personal Info',
    'AI'
  ];

  iconsGroups: string[] = [
    'insert_chart_outlined',
    'rss_feed',
    'chat_bubble_outline',
    'all_out',
    'post_add',
    'event',
    'poll',
    'bookmarks',
    'face',
    'cog'
  ];

  textsGroups: string[] = [
    'Private weekly lab report.',
    // 'Private news for lab members.',
    'Other solutions are built on top of an empty database and rely on the user to import prospects and data. They don’t provide dynamic information, track buy signals, or alert you of new prospects.',
    'Private chat for lab members.',
    'Fully featured seminars scheduler.',
    'Fully featured assignments scheduler.',
    'Private calendar for lab members.',
    'Private polls for lab members.',
    'Papers kit for lab members.',
    'Personal info for lab members.',
    'Auto-suggest of new content items for your lab profile.'
  ]

  upgradeFunc() {
     // && this.userService.planNumber==0
    if (this.userService.userId) {
      this.planUpdate();
    } else {
      this.login();
    }
  }

  async login() {
    await this.auth0Client.loginWithRedirect({});
  }

  async planUpdate() {
    const mode: number = 0; // User / Lab / Company / Department
    const type: number = 1; // Free / PRO / PRO+
    const period: number = 0; // Monthly / Yearly

    this.streamSubscribe = 3;
    const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, null);

    stripe.redirectToCheckout({
      sessionId: plan.id
    }).then(function (result) {
      this.streamSubscribe = 0;
    });
  }

}
