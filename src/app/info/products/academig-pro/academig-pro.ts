import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {AuthService} from '../../../auth/auth.service';
import {UserService} from '../../../user/services/user-service';
import {SettingsService} from '../../../shared/services/settings-service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

@Component({
  selector: 'academig-pro',
  templateUrl: 'academig-pro.html',
  styleUrls: ['academig-pro.css']
})
export class AcademigProComponent implements OnInit {
  isAuthenticated: boolean;

  streamSubscribe: number = 0;

  private auth0Client: Auth0Client;

  constructor(private titleService: Title,
              private userService: UserService,
              private settingsService: SettingsService,
              public authService: AuthService) {
    this.titleService.setTitle('Researcher Pro | Academig');
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();

    this.authService.isAuthenticated.subscribe(value => {
      this.isAuthenticated = value
    });
  }

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
