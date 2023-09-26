import {Component, OnInit, Input, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {ViewportScroller} from '@angular/common';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {MAT_STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';

import {ProductType, SubmitApp, ItemService} from '../../services/item-service';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

// https://www.research.net/r/scolary
// https://help.labworm.com/en/article/what-kind-of-tools-are-accepted-for-upload
// https://appsumo.com/partners/apply

@Component({
  selector: 'app-submit',
  templateUrl: 'submit.html',
  styleUrls: ['submit.css'],
  providers: [{
    // provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}
    provide: MAT_STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class SubmitAppComponent implements OnInit {
  // Creator of the tool? Claim it!
  productFormGroup: FormGroup;
  companyFormGroup: FormGroup;
  teamFormGroup: FormGroup;
  goalFormGroup: FormGroup;
  finishFormGroup: FormGroup;

  productInvalid: string[] = [];
  companyInvalid: string[] = [];
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

  productType: string[] = ProductType;

  goalType: string[] = [
    "Paid Lifetime Access To Your Product. Access to a premium version of your product for a one-time payment at heavily discounted pricing. (you focus primarily on revenue)",
    "Free One Year Access To Your Product. Free access to a premium version of your product. (you focus primarily on user acquisition)",
    "Community Spotlight. Full price/moderately discounted access with limited promotion. (you focus primarily on exposure)"
  ];
  goalMain: string[] = [
    "Revenue",
    "New users",
    "Beta testers and user feedback",
    "Exposure",
    "Other"
  ];

  submitFlag: boolean;
  submitCompleted: boolean = false

  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  marketCtrl = new FormControl();
  filteredMarkets: Observable<string[]>;
  markets: string[] = []; // ['SaaS'];
  allMarkets: string[] = ['SaaS', 'Productivity Software', 'Academic Social', 'Education', 'Collaboration'];

  @ViewChild('marketInput', { static: true }) marketInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

  constructor(private titleService: Title,
              private itemService: ItemService,
              private _formBuilder: FormBuilder,
              private viewportScroller: ViewportScroller,
              private _router: Router) {
    this.titleService.setTitle('Academic App Submit | Academig');
    this.filteredMarkets = this.marketCtrl.valueChanges.pipe(
        startWith(null),
        map((market: string | null) => market ? this._filter(market) : this.allMarkets.slice()));
  }

  ngOnInit() {
    this.productFormGroup = this._formBuilder.group({
      productName: [null, Validators.required],
      productURL: [null, Validators.required],
      productMarkets: [null, Validators.required],
      productType: [null, Validators.required],
      productDescription: [null, Validators.required],
      productBenefits: [null, Validators.required],
    });
    this.companyFormGroup = this._formBuilder.group({
      companyName: [null, Validators.required],
      companyYear: [null, Validators.required],
      companyUsers: [null, Validators.required],
      companyRevenue: [null, Validators.required],
      // companySupport: [null, Validators.required]
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
      productVersion: [null, Validators.required],
      priceFull: [null, Validators.required],
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
    if (i==5 && this.finishInvalid.length==0) this.onSubmit();
  }

  // https://stackoverflow.com/questions/57731339/how-does-matstepper-triggers-the-error-state-for-a-step
  findInvalidControls(i: number) {
    var controls;
    var err: string;
    var modified: string;

    if (i==1) {
      this.productInvalid = [];
      controls = this.productFormGroup.controls;
    } else if (i==2) {
      this.companyInvalid = [];
      controls = this.companyFormGroup.controls;
    } else if (i==3) {
      this.teamInvalid = [];
      controls = this.teamFormGroup.controls;
    } else if (i==4) {
      this.goalInvalid = [];
      controls = this.goalFormGroup.controls;
    } else if (i==5) {
      this.finishInvalid = [];
      controls = this.finishFormGroup.controls;
    }

    for (const name in controls) {
      if (controls[name].invalid) {
        modified = name;
        switch (name) {
          case "productName": modified="Product Name"; break;
          case "productURL": modified="Product Url"; break;
          case "productMarkets": modified="Product Markets"; break;
          case "productType": modified="Product Type"; break;
          case "productDescription": modified="Product One Sentence Pitch"; break;
          case "productBenefits": modified="Product Benefits"; break;

          case "companyName": modified="Company Name"; break;
          case "companyYear": modified="Company Year"; break;
          case "companyUsers": modified="Company Users"; break;
          case "companyRevenue": modified="Company Revenue"; break;
          // case "companySupport": modified="Company Support"; break;

          case "email": modified="Your Email"; break;
          case "twitter": modified="Your Twitter Account"; break;
          case "firstName": modified="First Name"; break;
          case "lastName": modified="Last Name"; break;
          case "role": modified="Your Role"; break;

          case "goal": modified="Launch Goal"; break;
          case "goalMain": modified="Main Goal"; break;
          case "goalType": modified="Goal Type"; break;
          case "productVersion": modified="Product Version"; break;
          case "priceFull": modified="Product Full Price"; break;

          case "referred": modified="Referred By"; break;
          case "comments": modified="Your comments"; break;
        };
        err = modified + ' is ' + ((controls[name].errors.required==true) ? 'required' : 'invalid');
        if (i==1) {
          this.productInvalid.push(err);
        } else if (i==2) {
          this.companyInvalid.push(err);
        } else if (i==3) {
          this.teamInvalid.push(err);
        } else if (i==4) {
          this.goalInvalid.push(err);
        } else if (i==5) {
          this.finishInvalid.push(err);
        }
      }
    }
    if ((i==1 && this.productInvalid.length>0) || (i==2 && this.companyInvalid.length>0) || (i==3 && this.teamInvalid.length>0) || (i==4 && this.goalInvalid.length>0) || (i==5 && this.finishInvalid.length>0)) this.viewportScroller.scrollToPosition([0, 0]);
  }

  async onSubmit() {
    this.submitFlag = true;

    const submitApp: SubmitApp = {
      "productName": this.productFormGroup.value.productName,
      "productURL": this.productFormGroup.value.productURL,
      "productMarket": this.productFormGroup.value.productMarkets,
      "productType": this.productFormGroup.value.productType,
      "productDescription": this.productFormGroup.value.productDescription,
      "productBenefits": this.productFormGroup.value.productBenefits,

      "companyName": this.companyFormGroup.value.companyName,
      "companyYear": this.companyFormGroup.value.companyYear,
      "companyUsers": this.companyFormGroup.value.companyUsers,
      "companyRevenue": this.companyFormGroup.value.companyRevenue,
      // companySupport: [null, Validators.required]

      "email": this.teamFormGroup.value.email,
      "twitter": this.teamFormGroup.value.twitter,
      "firstName": this.teamFormGroup.value.firstName,
      "lastName": this.teamFormGroup.value.lastName,
      "role": this.teamFormGroup.value.role,

      "goal": this.goalFormGroup.value.goal,
      "goalMain": this.goalFormGroup.value.goalMain,
      "goalType": this.goalFormGroup.value.goalType,
      "productVersion": this.goalFormGroup.value.productVersion,
      "priceFull": this.goalFormGroup.value.priceFull,

      "referred": this.finishFormGroup.value.referred,
      "comments": this.finishFormGroup.value.comments
    };
    console.log('submitApp',submitApp)
    const status = await this.itemService.putSubmitApp(submitApp);
    this.submitCompleted = true;
  }

}
