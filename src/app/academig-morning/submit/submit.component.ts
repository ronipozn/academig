import {Component, OnInit, Input} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {FormControl, FormGroup, Validators} from '@angular/forms';

import {MorningService} from '../services/morning-service';

export interface SubmitMorningData {
  news: any;
  lists: any;
  labs: any;
  trends: any;
  apps: any;
  podcasts: any;
  events: any;
  quotes: any;
}

@Component({
  selector: 'morning-submit',
  templateUrl: 'submit.html',
  styleUrls: ['submit.css']
})
export class SubmitComponent implements OnInit {
  storyFormGroup: FormGroup;

  submitFlag: boolean;
  submitCompleted: boolean = false

  constructor(private titleService: Title,
              private morningService: MorningService) {
    this.titleService.setTitle('Academig Morning Submit');
  }

  ngOnInit() {
    this.storyFormGroup = new FormGroup({
      topic: new FormControl(null, Validators.required),
      category: new FormControl(null, Validators.required),
      pic: new FormControl(null, Validators.required),
      alt: new FormControl(null, Validators.required),
      text: new FormControl(null, Validators.required)
    });
  }

  async onSubmit() {
    this.submitFlag = true;
    const status = await this.morningService.putStory(this.storyFormGroup.value);
    this.submitCompleted = true;
    this.submitFlag = false;
  }

}
