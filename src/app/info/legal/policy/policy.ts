import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {SharedService} from '../../../shared/services/shared-service';

@Component({
  selector: 'policy',
  templateUrl: 'policy.html'
})
export class PolicyComponent {
  subscriptionPolicy: Subscription;

  streamRetrieved: boolean;
  policy: any;
  policySafe: any;

  constructor(private titleService: Title,
              private sharedService: SharedService) {
    this.titleService.setTitle('Academig Policy');
    this.loadPolicy()
  }

  async loadPolicy() {
    this.streamRetrieved = false;
    this.policy = await this.sharedService.getPolicy();

    this.policySafe = this.policy.content.slice(37,-2);
    this.streamRetrieved = true;
  }

}
