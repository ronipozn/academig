import {Component, OnInit, Input, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {ViewportScroller} from '@angular/common';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {MAT_STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';

import {EventType, SubmitEvent, ItemService} from '../../services/item-service';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'event-submit',
  templateUrl: 'submit.html',
  styleUrls: ['submit.css'],
  providers: [{
    // provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}
    provide: MAT_STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class SubmitEventComponent implements OnInit {
  // Creator of the tool? Claim it!
  eventFormGroup: FormGroup;
  teamFormGroup: FormGroup;
  goalFormGroup: FormGroup;
  finishFormGroup: FormGroup;

  eventInvalid: string[] = [];
  teamInvalid: string[] = [];
  goalInvalid: string[] = [];
  finishInvalid: string[] = [];

  goalsTitle: string[] = ['Validate', 'Scale', 'Publish'];

  goalsIcon: string[] = ["rocket", "rss", "trophy"];

  goalsExplain: string[] = [
    'A growth stage company looking to acclerate your go-to-market strategy and gain new audiences',
    'An established company looking for new customer segments and geographical user bases',
    'A soloprenuer or team with content (courses, eBooks, conferences) made for academics'
  ];

  eventType: string[] = EventType;

  goalType: string[] = [
    "Paid Lifetime Access To Your Event. Access to a premium version of your event for a one-time payment at heavily discounted pricing. (you focus primarily on revenue)",
    "Free One Year Access To Your Event. Free access to a premium version of your event. (you focus primarily on user acquisition)",
    "Community Spotlight. Full price/moderately discounted access with limited promotion. (you focus primarily on exposure)"
  ];
  goalMain: string[] = [
    "Revenue",
    "New participants",
    "Feedback",
    "Exposure",
    "Other"
  ];

  submitFlag: boolean;
  submitCompleted: boolean = false

  // visible = true;
  // selectable = true;
  // removable = true;
  // separatorKeysCodes: number[] = [ENTER, COMMA];
  // marketCtrl = new FormControl();
  // filteredMarkets: Observable<string[]>;
  // markets: string[] = []; // ['SaaS'];
  // allMarkets: string[] = ['SaaS', 'Productivity Software', 'Academic Social', 'Education', 'Collaboration'];

  @ViewChild('marketInput', { static: true }) marketInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

  constructor(private titleService: Title,
              private itemService: ItemService,
              private _formBuilder: FormBuilder,
              private viewportScroller: ViewportScroller) {
    this.titleService.setTitle('Academic Event Submit | Academig');
    // this.filteredMarkets = this.marketCtrl.valueChanges.pipe(
    //     startWith(null),
    //     map((market: string | null) => market ? this._filter(market) : this.allMarkets.slice()));
  }

  ngOnInit() {
    this.eventFormGroup = this._formBuilder.group({
      eventName: [null, Validators.required],
      eventURL: [null, Validators.required],
      eventStart: [null, Validators.required],
      eventEnd: [null, Validators.required],
      eventMarkets: [null, Validators.required],
      eventType: [null, Validators.required],
      eventDescription: [null, Validators.required],
      eventBenefits: [null, Validators.required],
    });
    this.teamFormGroup = this._formBuilder.group({
      email: [null, Validators.required],
      twitter: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      role: [null, Validators.required]
    });
    this.goalFormGroup = this._formBuilder.group({
      goal: [null, Validators.required],
      goalMain: [null, Validators.required],
      goalType: [null, Validators.required],
      priceFull: [null, Validators.required],
    });
    this.finishFormGroup = this._formBuilder.group({
      referred: [null, Validators.required],
      comments: [null, Validators.required]
    });
  }

  onContinue(i: number) {
    this.findInvalidControls(i);
    if (i==4 && this.finishInvalid.length==0) this.onSubmit();
  }

  // https://stackoverflow.com/questions/57731339/how-does-matstepper-triggers-the-error-state-for-a-step
  findInvalidControls(i: number) {
    var controls;
    var err: string;
    var modified: string;

    if (i==1) {
      this.eventInvalid = [];
      controls = this.eventFormGroup.controls;
    } else if (i==2) {
      this.teamInvalid = [];
      controls = this.teamFormGroup.controls;
    } else if (i==3) {
      this.goalInvalid = [];
      controls = this.goalFormGroup.controls;
    } else if (i==4) {
      this.finishInvalid = [];
      controls = this.finishFormGroup.controls;
    }

    for (const name in controls) {
      if (controls[name].invalid) {
        modified = name;
        switch (name) {
          case "eventName": modified="Event Name"; break;
          case "eventURL": modified="Event Url"; break;
          case "eventMarkets": modified="Event Markets"; break;
          case "eventType": modified="Event Type"; break;
          case "eventDescription": modified="Event One Sentence Pitch"; break;
          case "eventBenefits": modified="Event Benefits"; break;

          case "email": modified="Your Email"; break;
          case "twitter": modified="Your Twitter Account"; break;
          case "firstName": modified="First Name"; break;
          case "lastName": modified="Last Name"; break;
          case "role": modified="Your Role"; break;

          case "goal": modified="Launch Goal"; break;
          case "goalMain": modified="Main Goal"; break;
          case "goalType": modified="Goal Type"; break;
          case "eventVersion": modified="Event Version"; break;
          case "priceFull": modified="Event Full Price"; break;

          case "referred": modified="Referred By"; break;
          case "comments": modified="Your comments"; break;
        };
        err = modified + ' is ' + ((controls[name].errors.required==true) ? 'required' : 'invalid');
        if (i==1) {
          this.eventInvalid.push(err);
        } else if (i==2) {
          this.teamInvalid.push(err);
        } else if (i==3) {
          this.goalInvalid.push(err);
        } else if (i==4) {
          this.finishInvalid.push(err);
        }
      }
    }
    if ((i==1 && this.eventInvalid.length>0) || (i==2 && this.teamInvalid.length>0) || (i==3 && this.goalInvalid.length>0) || (i==4 && this.finishInvalid.length>0)) this.viewportScroller.scrollToPosition([0, 0]);
  }

  async onSubmit() {
    this.submitFlag = true;

    const submitEvent: SubmitEvent = {
      "eventName": this.eventFormGroup.value.eventName,
      "eventURL": this.eventFormGroup.value.eventURL,
      "eventMarkets": this.eventFormGroup.value.eventMarkets,
      "eventType": this.eventFormGroup.value.eventType,
      "eventDescription": this.eventFormGroup.value.eventDescription,
      "eventBenefits": this.eventFormGroup.value.eventBenefits,
      "eventYear": this.eventFormGroup.value.eventYear,
      "eventStartDate": this.eventFormGroup.value.eventStartDate,
      "eventEndDate": this.eventFormGroup.value.eventEndDate,

      "email": this.teamFormGroup.value.email,
      "twitter": this.teamFormGroup.value.twitter,
      "firstName": this.teamFormGroup.value.firstName,
      "lastName": this.teamFormGroup.value.lastName,
      "role": this.teamFormGroup.value.role,

      "goal": this.goalFormGroup.value.goal,
      "goalMain": this.goalFormGroup.value.goalMain,
      "goalType": this.goalFormGroup.value.goalType,
      "priceFull": this.goalFormGroup.value.priceFull,

      "referred": this.finishFormGroup.value.referred,
      "comments": this.finishFormGroup.value.comments
    };
    console.log('submitEvent',submitEvent)
    const status = await this.itemService.putSubmitEvent(submitEvent);
    this.submitCompleted = true;
  }

}
