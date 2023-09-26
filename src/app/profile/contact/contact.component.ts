import {Component, OnDestroy, OnInit, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../services/mission-service';

import {UserService} from '../../user/services/user-service';
import {ToastService} from '../../user/services/toast.service';

import {ContactService} from '../../shared/services/contact-service';
import {PublicInfo, SocialInfo, groupComplex} from '../../shared/services/shared-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
    selector: 'profile-contact',
    templateUrl: 'contact.html',
    styleUrls: ['contact.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class ContactComponent implements OnInit {
  submitFlag = 0;
  subject: string;
  message: string;
  action: string;

  public: PublicInfo;
  social: SocialInfo;

  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  constructor(public titleService: Title,
              public contactService: ContactService,
              public missionService: MissionService,
              public userService: UserService,
              private toastService: ToastService) {
  }

  ngOnInit() {
    this.public = this.missionService.publicInfo;
    this.social = this.missionService.socialInfo;
    this.titleService.setTitle('Contact - ' + this.missionService.peopleName + ' | Academig');
  }

  async contactSend() {
    if (this.userService.userId && this.userService.userEmailVerified) {
      this.submitFlag = 1;
      await this.contactService.putContactMessage(this.missionService.peopleId, 1, this.subject, this.message);
      this.toastService.showNotification('bottom', 'left', 'Your message has been sent');
      this.submitFlag = 2;
      this.subject = '';
      this.message = '';
    } else {
      this.action = "message";
      this.toggleSignUp.nativeElement.click();
    }
  }

  togglePreviewEmail(popover) {
    if (popover.isOpen()) {
      popover.close();
    } else {
      popover.open();
    }
  }

}
