import {Component, Input, OnInit, ViewChild, ElementRef} from '@angular/core';

import {userAccount, SettingsService} from '../../shared/services/settings-service';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';
import {Countries} from '../../shared/services/shared-service';
import {SharedService} from '../../shared/services/shared-service';

@Component({
  selector: 'settings-account',
  templateUrl: 'account.html'
})
export class AccountComponent implements OnInit {
  @ViewChild('togglePasswordModal', { static: true }) togglePassword: ElementRef;

  profile: any;
  oauthType: string;
  account: userAccount;

  streamRetrieved: boolean = true;
  passwordModalDisable: boolean = false;
  requestDisable: boolean = false;

  countries = Countries;
  country_id: string;
  streamCountry: boolean = true;

  constructor(public authService: AuthService,
              public userService: UserService,
              public sharedService: SharedService,
              public settingsService: SettingsService) {
  }

  ngOnInit() {
    this.authService.profile.subscribe(profile => {
      this.profile = profile;
      this.oauthType = this.profile.sub.split('|')[0];
      // console.log('oauthType',this.oauthType)
    });

    this.userAccount();
  }

  async userAccount() {
    this.streamRetrieved = false;
    this.account = await this.settingsService.getUserAccount();
    this.country_id = this.account.country ? this.account.country.toString() : null;
    this.streamRetrieved = true;
  }

  async updateCountry() {
    this.streamCountry = false;
    await this.sharedService.updateLocation(0, this.userService.userId, null, null, Number(this.country_id), null, null);
    this.streamCountry = true;
  }

  async changePassword() {
    this.passwordModalDisable = true;
    await this.settingsService.resetUserPassword();
    this.togglePassword.nativeElement.click();
    this.passwordModalDisable = false;
  }

  async requestData() {
    this.requestDisable = true;
    await this.settingsService.requestUserData();
    this.requestDisable = false;
    this.account.data = {
      flag: true,
      date: new Date()
    };
  }

}
