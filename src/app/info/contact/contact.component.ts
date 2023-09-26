import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {SupportService} from '../../shared/services/support-service';

@Component({
  selector: 'contact',
  templateUrl: 'contact.html',
  styleUrls: ['contact.css']
})
export class ContactComponent {
  subscriptionPut: Subscription;

  name: string;
  email: string;
  category = 0;
  subject: string;
  message: string;

  submitFlag: number = 0;

  constructor(private titleService: Title,
              private supportService: SupportService) {
    this.titleService.setTitle('Contact Us | Academig');
  }

  async contactUpdate() {
    this.submitFlag = 1;

    await this.supportService.putSupport(this.name, this.email, this.category, this.subject, this.message);

    this.submitFlag = 2;
    this.name = '';
    this.email = '';
    this.category = 0;
    this.subject = '';
    this.message = '';
  }

}
