import {Component, OnInit, Input} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {FormControl, FormBuilder, FormGroup, FormArray, Validators} from '@angular/forms';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {MAT_STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';

// import {SubmitPodcast} from '../services/podcast-service';
import {DailyService} from '../services/daily-service';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'TDKUK8VW4T',
  '73303e9badf36767a06c37395b6a3693'
);

import {environment} from '../../../environments/environment';

export interface SubmitDailyData {
  news: any;
  lists: any;
  labs: any;
  trends: any;
  apps: any;
  podcasts: any;
  events: any;
  quotes: any;
  title: string;
  sub_title: string;
}

@Component({
  selector: 'daily-submit',
  templateUrl: 'submit.html',
  styleUrls: ['submit.css'],
  providers: [{
    // provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}
    provide: MAT_STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class SubmitComponent implements OnInit {
  newsFormGroup: FormGroup;
  listsFormGroup: FormGroup;
  labsFormGroup: FormGroup;
  trendsFormGroup: FormGroup;
  appsFormGroup: FormGroup;
  podcastsFormGroup: FormGroup;
  eventsFormGroup: FormGroup;
  quotesFormGroup: FormGroup;
  submitFormGroup: FormGroup;

  submitFlag: boolean;
  submitCompleted: boolean = false

  config_labs = {
    indexName: 'labs', //environment.algolia.labs,
    searchClient
  };

  config_trends = {
    indexName: environment.algolia.trends,
    searchClient
  };

  config_podcasts = {
    indexName: environment.algolia.podcasts,
    searchClient
  };

  config_events = {
    indexName: environment.algolia.events,
    searchClient
  };

  config_apps = {
    indexName: environment.algolia.apps,
    searchClient
  };

  constructor(private titleService: Title,
              private dailyService: DailyService,
              private _formBuilder: FormBuilder) {
    this.titleService.setTitle('Academig Daily Submit | Academig');
  }

  ngOnInit() {
    this.newsFormGroup = this._formBuilder.group({news: new FormArray([])});
    const fieldNews = this.newsFormGroup.get('news') as FormArray;
    for (let _i = 0; _i <= 2; _i++) {
      fieldNews.push(
        new FormGroup({
          topic: new FormControl(),
          link: new FormControl(),
          pic: new FormControl(),
          date: new FormControl(),
          website: new FormControl(),
          source: new FormControl(),
          authorName: new FormControl(),
          authorLink: new FormControl(),
          description: new FormControl(),
          categories: new FormControl(),
        })
      );
    }

    this.listsFormGroup = this._formBuilder.group({lists: new FormArray([])});
    const fieldLists = this.listsFormGroup.get('lists') as FormArray;
    for (let _i = 0; _i <= 1; _i++) {
      fieldLists.push(
        new FormGroup({
          name: new FormControl(),
          params: new FormControl(),
          type: new FormControl(),
          entries: new FormControl()
        })
      );
    }

    this.labsFormGroup = this._formBuilder.group({labs: new FormArray([])});
    const fieldLabs = this.labsFormGroup.get('labs') as FormArray;
    for (let _i = 0; _i <= 1; _i++) {
      fieldLabs.push(
        new FormGroup({
          link: new FormControl(),
          lab: new FormControl(),
          discipline: new FormControl(),
          university: new FormControl(),
          country: new FormControl()
        })
      );
    }

    this.trendsFormGroup = this._formBuilder.group({trends: new FormArray([])});
    const fieldTrends = this.trendsFormGroup.get('trends') as FormArray;
    for (let _i = 0; _i < 1; _i++) {
      fieldTrends.push(
        new FormGroup({
          topic: new FormControl(),
          pic: new FormControl(),
          source: new FormControl(),
          types: new FormControl(),
          clips: new FormControl(),
          description: new FormControl(),
          subs: new FormControl(),
          categories: new FormControl()
        })
      );
    }

    this.appsFormGroup = this._formBuilder.group({apps: new FormArray([])});
    const fieldApps = this.appsFormGroup.get('apps') as FormArray;
    for (let _i = 0; _i <= 1; _i++) {
      fieldApps.push(
        new FormGroup({
          companyName: new FormControl(),
          appName: new FormControl(),
          // link: new FormControl(),
          // pic: new FormControl(),
          description: new FormControl(),
          category: new FormControl(),
        })
      );
    }

    this.podcastsFormGroup = this._formBuilder.group({podcasts: new FormArray([])});
    const fieldPodcasts = this.podcastsFormGroup.get('podcasts') as FormArray;
    for (let _i = 0; _i <= 1; _i++) {
      fieldPodcasts.push(
        new FormGroup({
          podcastName: new FormControl(),
          episodeName: new FormControl(),
          episodeLink: new FormControl(),
          // pic: new FormControl(),
          description: new FormControl(),
          category: new FormControl(),
        })
      );
    }

    this.eventsFormGroup = this._formBuilder.group({events: new FormArray([])});
    const fieldEvents = this.eventsFormGroup.get('events') as FormArray;
    for (let _i = 0; _i <= 1; _i++) {
      fieldEvents.push(
        new FormGroup({
          name: new FormControl(),
          // link: new FormControl(),
          // pic: new FormControl(),
          // description: new FormControl(),
          // language: new FormControl(),
          startDate: new FormControl(),
          endDate: new FormControl(),
          category: new FormControl(),
        })
      );
    }

    this.quotesFormGroup = this._formBuilder.group({quotes: new FormArray([])});
    const fieldQuotes = this.quotesFormGroup.get('quotes') as FormArray;
    for (let _i = 0; _i < 1; _i++) {
      fieldQuotes.push(
        new FormGroup({
          quote: new FormControl(),
          authorName: new FormControl(),
          authorPic: new FormControl(),
          tags: new FormControl(),
        })
      );
    }

    this.submitFormGroup = new FormGroup({
      title: new FormControl(null, Validators.required),
      sub_title: new FormControl(null, Validators.required),
    });

  }

  selectionChange(type: string, i: number, hit) {
    let field;
    switch (type) {
      case 'lab': {
        field = this.labsFormGroup.get('labs') as FormArray;
        field.at(i).get('link').setValue(hit.value.groupIndex.university.link + '/' + hit.value.groupIndex.department.link + '/' +hit.value.groupIndex.group.link);
        field.at(i).get('lab').setValue(hit.value.groupIndex.group.name);
        field.at(i).get('discipline').setValue(hit.value.groupIndex.department.name);
        field.at(i).get('university').setValue(hit.value.groupIndex.university.name);
        field.at(i).get('country').setValue(hit.value.country);
      }; break;
      case 'trend': {
        field = this.trendsFormGroup.get('trends') as FormArray;
        field.at(i).get('topic').setValue(hit.value.topic);
        field.at(i).get('pic').setValue(hit.value.pic);
        field.at(i).get('source').setValue(hit.value.source);
        field.at(i).get('types').setValue(hit.value.types);
        field.at(i).get('clips').setValue(hit.value.clips);
        field.at(i).get('description').setValue(hit.value.description);
        field.at(i).get('subs').setValue(hit.value.subs);
        field.at(i).get('categories').setValue(hit.value.category);
      }; break;
      case 'podcast': {
        field = this.podcastsFormGroup.get('podcasts') as FormArray;
        field.at(i).get('podcastName').setValue(hit.value.name);
        // field.at(i).get('episodeName').setValue(hit.value.website);
        // field.at(i).get('episodeLink').setValue(hit.value.website);
        // field.at(i).get('pic').setValue(hit.value.pic);
        field.at(i).get('description').setValue(hit.value.description);
        field.at(i).get('categories').setValue(hit.value.category);
      }; break;
      case 'event': {
        field = this.eventsFormGroup.get('events') as FormArray;
        field.at(i).get('name').setValue(hit.value.name);
        // field.at(i).get('link').setValue(hit.value.link);
        // field.at(i).get('pic').setValue(hit.value.pic);
        // field.at(i).get('language').setValue(hit.value.language);
        field.at(i).get('startDate').setValue(hit.value.startDate);
        field.at(i).get('endDate').setValue(hit.value.endDate);
        // field.at(i).get('description').setValue(hit.value.description);
        field.at(i).get('categories').setValue(hit.value.category);
      }; break;
      case 'app': {
        field = this.appsFormGroup.get('apps') as FormArray;
        field.at(i).get('companyName').setValue(hit.value.companyName);
        field.at(i).get('appName').setValue(hit.value.appName);
        // field.at(i).get('link').setValue(hit.value.link);
        // field.at(i).get('pic').setValue(hit.value.pic);
        field.at(i).get('description').setValue(hit.value.description);
        field.at(i).get('categories').setValue(hit.value.category);
      }; break;
    }
  }

  onContinue(i: number) {
    // this.findInvalidControls(i);
    // if (i==4 && this.submitInvalid.length==0) this.onSubmit();
  }

  async onSubmit() {
    this.submitFlag = true;

    const submitDaily: SubmitDailyData = {
      news: this.newsFormGroup.value.news,
      lists: this.listsFormGroup.value.lists,
      labs: this.labsFormGroup.value.labs,
      trends: this.trendsFormGroup.value.trends,
      apps: this.appsFormGroup.value.apps,
      podcasts: this.podcastsFormGroup.value.podcasts,
      events: this.eventsFormGroup.value.events,
      quotes: this.quotesFormGroup.value.quotes,
      title: this.submitFormGroup.value.title,
      sub_title: this.submitFormGroup.value.sub_title,
    };

    const status = await this.dailyService.putDaily(submitDaily);
    this.submitCompleted = true;
    this.submitFlag = false;
  }

}
