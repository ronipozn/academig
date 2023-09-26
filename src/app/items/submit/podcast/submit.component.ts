import {Component, OnInit, Input, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {ViewportScroller} from '@angular/common';

import {FormControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {MAT_STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';

import {PodcastType, SubmitPodcast, ItemService} from '../../services/item-service';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'podcast-submit',
  templateUrl: 'submit.html',
  styleUrls: ['submit.css'],
  providers: [{
    // provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}
    provide: MAT_STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class SubmitPodcastComponent implements OnInit {
  podcastFormGroup: FormGroup;
  teamFormGroup: FormGroup;
  goalFormGroup: FormGroup;
  finishFormGroup: FormGroup;

  podcastInvalid: string[] = [];
  teamInvalid: string[] = [];
  goalInvalid: string[] = [];
  finishInvalid: string[] = [];

  podcastType: string[] = PodcastType;

  goalsTitle: string[] = ['Validate', 'Scale', 'Publish'];
  goalsIcon: string[] = ["rocket", "rss", "trophy"];
  goalsExplain: string[] = [
    'A podcast in the early days looking for its first true fans',
    'A growth stage podcast looking to accelerate the number of downloads and gain new fans',
    'An established podcast looking for new audience segments, diversify geographically or professionally'
  ];

  submitFlag: boolean;
  submitCompleted: boolean = false

  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  marketCtrl = new FormControl();
  filteredMarkets: Observable<string[]>;
  markets: string[] = []; //['SaaS'];
  allMarkets: string[] = ['SaaS', 'Productivity Software', 'Academic Social', 'Education', 'Collaboration'];

  @ViewChild('marketInput', { static: true }) marketInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

  constructor(private titleService: Title,
              private itemService: ItemService,
              private _formBuilder: FormBuilder,
              private viewportScroller: ViewportScroller,
              private _router: Router) {
    this.titleService.setTitle('Academic Podcast Submit | Academig');
    this.filteredMarkets = this.marketCtrl.valueChanges.pipe(
        startWith(null),
        map((market: string | null) => market ? this._filter(market) : this.allMarkets.slice()));
  }

  ngOnInit() {
    this.podcastFormGroup = this._formBuilder.group({
      podcastName: [null, Validators.required],
      podcastURL: [null, Validators.required],
      podcastMarkets: [null, Validators.required],
      podcastType: [null, Validators.required],
      podcastDescription: [null, Validators.required],
      podcastBenefits: [null, Validators.required],
      podcastYear: [null, Validators.required],
      podcastUsers: [null, Validators.required],
    });

    this.teamFormGroup = this._formBuilder.group({
      email: [null, Validators.required],
      twitter: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      role: [null, Validators.required]
    });

    this.goalFormGroup = this._formBuilder.group({
      goal: [null, Validators.required]
    });

    this.finishFormGroup = this._formBuilder.group({
      referred: [null, Validators.required],
      comments: [null, Validators.required]
    });
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our market
    if ((value || '').trim()) {
      this.markets.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.marketCtrl.setValue(null);
  }

  remove(market: string): void {
    const index = this.markets.indexOf(market);

    if (index >= 0) {
      this.markets.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.markets.push(event.option.viewValue);
    // this.marketInput.nativeElement.value = '';
    this.marketCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allMarkets.filter(market => market.toLowerCase().indexOf(filterValue) === 0);
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

    console.log('i',i)

    if (i==1) {
      this.podcastInvalid = [];
      controls = this.podcastFormGroup.controls;
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
          case "podcastName": modified="Podcast Name"; break;
          case "podcastURL": modified="Podcast Url"; break;
          case "podcastMarkets": modified="Podcast Markets"; break;
          case "podcastType": modified="Podcast Type"; break;
          case "podcastDescription": modified="Podcast One Sentence Pitch"; break;
          case "podcastBenefits": modified="Podcast Benefits"; break;
          case "podcastYear": modified="Podcast Year"; break;
          case "podcastUsers": modified="Podcast Users"; break;
          // case "podcastRevenue": modified="Podcast Revenue"; break;

          case "email": modified="Your Email"; break;
          case "twitter": modified="Your Twitter Account"; break;
          case "firstName": modified="First Name"; break;
          case "lastName": modified="Last Name"; break;
          case "role": modified="Your Role"; break;

          case "goal": modified="Launch Goal"; break;
          case "referred": modified="Referred By"; break;
          case "comments": modified="Your comments"; break;
        };
        err = modified + ' is ' + ((controls[name].errors.required==true) ? 'required' : 'invalid');
        if (i==1) {
          this.podcastInvalid.push(err);
        } else if (i==2) {
          this.teamInvalid.push(err);
        } else if (i==3) {
          this.goalInvalid.push(err);
        } else if (i==4) {
          this.finishInvalid.push(err);
        }
      }
    }
    if ((i==1 && this.podcastInvalid.length>0) || (i==2 && this.teamInvalid.length>0) || (i==3 && this.goalInvalid.length>0) || (i==4 && this.finishInvalid.length>0)) this.viewportScroller.scrollToPosition([0, 0]);
  }

  async onSubmit() {
    this.submitFlag = true;

    const submitPodcast: SubmitPodcast = {
      "podcastName": this.podcastFormGroup.value.podcastName,
      "podcastURL": this.podcastFormGroup.value.podcastURL,
      "podcastMarkets": this.podcastFormGroup.value.podcastMarkets,
      "podcastType": this.podcastFormGroup.value.podcastType,
      "podcastDescription": this.podcastFormGroup.value.podcastDescription,
      "podcastBenefits": this.podcastFormGroup.value.podcastBenefits,
      "podcastYear": this.podcastFormGroup.value.podcastYear,
      "podcastUsers": this.podcastFormGroup.value.podcastUsers,

      "email": this.teamFormGroup.value.email,
      "twitter": this.teamFormGroup.value.twitter,
      "firstName": this.teamFormGroup.value.firstName,
      "lastName": this.teamFormGroup.value.lastName,
      "role": this.teamFormGroup.value.role,

      "goal": this.goalFormGroup.value.goal,

      "referred": this.finishFormGroup.value.referred,
      "comments": this.finishFormGroup.value.comments
    };
    const status = await this.itemService.putSubmitPodcast(submitPodcast);
    this.submitCompleted = true;
  }

}
