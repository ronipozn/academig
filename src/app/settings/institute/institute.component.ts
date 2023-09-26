import {Component, Input, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {UserService} from '../../user/services/user-service';
import {SettingsService} from '../../shared/services/settings-service';
import {PositionMini} from '../../shared/services/people-service';

@Component({
  selector: 'settings-institute',
  templateUrl: 'institute.html'
})
export class InstituteComponent implements OnInit {
  @ViewChild('toggleEmailModal', { static: true }) toggleEmail: ElementRef;

  streamRetrieved = true;

  email = '';
  groupIndex: number;
  btnMode = 0;
  btnsDisabled = false;

  superAdminPosition: PositionMini[];

  constructor(public userService: UserService,
              public settingsService: SettingsService) { }

  ngOnInit() {
    this.superAdminPosition = this.userService.userPositions.filter(r => (r.status>5 && r.status<8));
  }

  emailModal(index: number, mode: number) {
    this.groupIndex = index;
    this.btnMode = mode
    this.email = '';
    this.toggleEmail.nativeElement.click();
  }

  async changeEmail() {
    this.streamRetrieved = false;
    this.btnsDisabled = true;

    const email: string = (this.btnMode==1) ? this.email : this.userService.userPositions[this.groupIndex].email.address;

    await this.settingsService.postEmail(this.userService.userPositions[this.groupIndex].group.group._id, email);

    this.streamRetrieved = true;
    this.btnsDisabled = false;
    this.toggleEmail.nativeElement.click();
    this.userService.userPositions[this.groupIndex].email = {
      "address": email,
      "stage": 0,
      "updated": new Date(),
    }
  }

}
