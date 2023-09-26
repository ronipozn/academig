import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {AuthService} from '../../auth/auth.service';

import { UserService } from '../../user/services/user-service';
import { SettingsService } from '../../shared/services/settings-service';

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  // { path: '/', title: 'Home',  icon: 'dashboard', class: 'home' },
  // { path: '/upgrade', title: 'Upgrade to PRO', icon:'unarchive', class: 'active-pro' }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  searchText: string;

  private auth0Client: Auth0Client;

  @Input() unseen: number;
  @Input() unread: number;
  @Input() adminFlag: boolean;

  @Input() planNumber: number;
  @Input() isAuthenticated: boolean;

  constructor(public userService: UserService,
              public authService: AuthService,
              public settingsService: SettingsService,
              private router: Router) { }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }

  keyUpOp(query: string) {
    this.searchText = query;
  }

  onSearch() {
    if (this.searchText) {
      this.userService.searchText = this.searchText;
      this.router.navigate(['./search']);
    }
  }

  buildWebsiteFunc() {
    this.userService.buildScratchWebsiteFlag = true;
    this.router.navigate(['/build']);
  }

  pricingClick(type: number) {
    if (type==0) {
      this.router.navigate(['/pricing'], { fragment: 'researchers' });
    } else {
      this.router.navigate(['/pricing'], { fragment: 'labs' });
    }
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  logout() {
    this.auth0Client.logout({
      client_id: this.authService.config.client_id,
      returnTo: window.location.origin
    });
  }

  async login() {
    await this.auth0Client.loginWithRedirect({
      redirect_uri: `${window.location.origin}/callback`,
      appState: { target: this.router.url }
    });
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

}
