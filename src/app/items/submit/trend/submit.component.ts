import {Component, OnInit, Input, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {FormControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {ItemService} from '../../services/item-service';

@Component({
  selector: 'trend-submit',
  templateUrl: 'submit.html',
  styleUrls: ['submit.css']
})
export class SubmitTrendComponent implements OnInit {
  // Creator of the tool? Claim it!
  trendFormGroup: FormGroup;

  submitFlag: boolean;
  submitCompleted: boolean = false

  constructor(private titleService: Title,
              private itemService: ItemService,
              private _formBuilder: FormBuilder) {
    this.titleService.setTitle('Academic Trend Request | Academig');
  }

  ngOnInit() {
    this.trendFormGroup = this._formBuilder.group({
      trend: [null, Validators.required]
    });
  }

  async onSubmit() {
    this.submitFlag = true;
    const status = await this.itemService.putSubmitTrend(this.trendFormGroup.value.trend);
    this.submitCompleted = true;
  }

}
