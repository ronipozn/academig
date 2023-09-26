import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {UserService} from '../user/services/user-service';
import {titlesTypes} from '../shared/services/people-service';

@Component({
    selector: 'settings',
    templateUrl: 'settings.html',
    styleUrls: ['settings.css'],
})
export class SettingsComponent {

  titlesSelect = titlesTypes;

  constructor(private router: Router,
              private titleService: Title,
              public userService: UserService) {
    this.titleService.setTitle('Settings - ' + this.userService.userName + " | Academig");
  }

  userNavigate() {
    // this.userService.announcePopulate("1");
    this.userService.buildPersonalWebsiteFlag = true;
    this.router.navigate(['/build']);
  }

}
