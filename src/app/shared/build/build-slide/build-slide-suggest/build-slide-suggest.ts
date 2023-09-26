import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

import { slideInOutAnimation } from '../../../animations/index';
import {complexName} from '../../../services/shared-service';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-suggest',
    templateUrl: 'build-slide-suggest.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-suggest.css']
})

export class BuildSlideSuggestComponent implements OnInit {
  @Input() mode: number = 0;
  @Input() counter: number = 0;
  @Input() object: complexName;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  uploadFlag: boolean = false;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  file: string;

  // ai_count: Number(event.ai_count),
  // ai_categories: [Number(event.ai_category_0), Number(event.ai_category_1)],
  // ai_titles: [event.ai_title_0, event.ai_title_1],

  aiSelect = [
              {display: 'Research field', value: 0},
              {display: 'Project', value: 1},
              {display: 'People', value: 2},
              {display: 'Publications', value: 3},
              {display: 'Collaborations', value: 4},
              {display: 'Funding', value: 5},
              {display: 'Open Positions', value: 6},
              {display: 'Teaching', value: 7},
              {display: 'Gallery', value: 8},
              {display: 'FAQ', value: 0},
              {display: 'Media', value: 10},
              {display: 'Contacts', value: 11},
             ];

  ngOnInit() {
    this.formModel = new FormGroup({
      url: new FormControl(this.object ? this.object.link : null, [Validators.required, CustomValidators.url]),
      text: new FormControl(''),
    });
  }

  ngAfterViewInit() {
    const that = this;
    that.uploadFlag = true;

    const widget = uploadcare.Widget('#file');
    widget.onChange(function(value) {
      if (value) {
        value.promise().done(function(info) {
          that.file = info.cdnUrl;
        });
      } else {
        that.file = '';
      }
    });

    if (this.counter>0) {
      widget.value(this.object.pic);
      this.formModel.value.pic = this.object.pic;
    };

  }

  onSubmit() {
    if (this.formModel.valid) {
      this.formModel.value.pic = this.file;
      this.disableFlag = true;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
