import {Component, Input, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';

import {UserService} from '../../user/services/user-service';
import {SettingsService} from '../../shared/services/settings-service';
import {SupportService} from '../../shared/services/support-service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'settings-delete',
  templateUrl: 'delete.html'
})
export class DeleteComponent {
  streamDelete = true;
  piFlag: number = 0;

  category: number = 0;
  message: string;

  private auth0Client: Auth0Client;

  @ViewChild('toggleDeleteModal', { static: true }) toggleDelete: ElementRef;

  constructor(private userService: UserService,
              private settingsService: SettingsService,
              private authService: AuthService,
              private supportService: SupportService) {
    this.piFlag = userService.userPositions.filter(x => x.status == 6).length;
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
  }

  async supporPut() {
    this.streamDelete = false;

    await this.supportService.putSupport(this.userService.userName + '. User ID: ' + this.userService.userId, this.userService.userEmail, this.category, 'User Delete', this.message);

    this.category = 0;
    this.message = '';
    this.deleteFunc();
  }

  async deleteFunc() {
    this.streamDelete = false;
    await this.settingsService.userDelete();
    this.streamDelete = true;
    
    this.toggleDelete.nativeElement.click();
    this.logout()
  }

  logout() {
    this.auth0Client.logout({
      client_id: this.authService.config.client_id,
      returnTo: window.location.origin
    });
  }

}
