import {Component, Input, OnInit, ViewChild, ElementRef, } from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
// ChangeDetectorRef

import {UserService} from '../../user/services/user-service';
import {Plan, Payment, SettingsService} from '../../shared/services/settings-service';

import * as moment from 'moment';

@Component({
  selector: 'plan',
  templateUrl: 'plan.html',
  styleUrls: ['plan.css']
})
export class PlanComponent implements OnInit {
  @Input() groupId: string;
  @Input() source: number = 1; // 1 - Settings
  @Input() mode: number = 0;   // 0 - Researcher
                               // 1 - Lab
                               // 2 - Company
                               // 3 - Department

  streamRetrieved: boolean = false;
  streamRetrievedPlan: boolean = false;

  streamSubscribe: number = 0;

  payment: Payment;
  plan: Plan;

  planResearchers: string[] = ['Free', 'PRO', 'PRO & Mentors'];
  planLabs: string[] = ['Free', 'Tools PRO', 'AI PRO', "Service Posting", "Job Posting"];
  modeName: string[] = ['Researcher', 'Lab', 'Company', 'Department'];
  periodStrLong = ['Monthly', 'Yearly'];

  @ViewChild('togglePricingInfoModal', { static: true }) togglePricingInfo: ElementRef;

  constructor(public userService: UserService,
              public settingsService: SettingsService) {
  }

  ngOnInit() {
    this.getPayment();
    this.getPlan();
  }

  async getPayment() {
    this.payment = await this.settingsService.getStripePayment(this.mode, this.groupId);

    this.streamRetrieved = true;

    if (this.payment.card) {
      // this.formModel.setValue({
      //   name: this.payment.card.name,
      //   // email: this.payment.card.email,
      //   address: this.payment.card.address,
      //   city: this.payment.card.city,
      //   state: this.payment.card.state,
      //   country: this.payment.card.country,
      //   vat: this.payment.card.vat ? this.payment.card.vat : ''
      // });
    } else {
      this.payment = {
        card: null,
        invoices: []
      }
    }
  }

  async getPortal() {
    const url: any = await this.settingsService.getStripePortal(this.mode, this.groupId);
    window.location.href = url;
  }

  async getPlan() {
    this.plan = await this.settingsService.getStripePlan(this.mode, this.groupId);
    this.streamRetrievedPlan = true;
    if (this.plan.subscriptions) {
      this.plan.subscriptions.forEach((sub, index) => {
        sub.created = moment.unix(sub.created).format("MMMM DD, YYYY");
        sub.end = moment.unix(sub.trial_end).toDate();
      });
    } else {
      this.plan.subscriptions = null;
    }
    console.log('plan ',this.plan)
  }

  async sourceUpdate() {
    this.streamSubscribe = 3;
    const stripeSource = await this.settingsService.postStripeSource(this.mode, this.groupId);
    stripe.redirectToCheckout({
      sessionId: stripeSource.id
    }).then(function (result) {
      this.streamSubscribe = 0;
    });
  }

  pricingModal() {
    this.togglePricingInfo.nativeElement.click();
  }

  async planUpdate(type: number, mode: number, period: number) {
    // Type: 0: Free / 1: PRO
    // Mode: 0: User / 1: Lab / 2: Company / 3: Department
    // Period: 0: Monthly / 1: Yearly

    this.streamSubscribe = 3;
    const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, this.groupId);

    if (type==0) {
      window.location.reload();
    } else {
      stripe.redirectToCheckout({
        sessionId: plan.id
      }).then(function (result) {
        this.router.navigate(result.success_url);
        this.streamSubscribe = 0;
      });
    }
  }

}
