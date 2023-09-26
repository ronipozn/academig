import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../../../shared/animations/index';
import { CustomValidators } from 'ng2-validation';

import { complexName } from '../../../../shared/services/shared-service';

declare var uploadcare: any;

@Component({
    selector: 'admin-contest-build',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class BuildLabContestComponent implements OnInit {
  @Input() contest: any;
  @Input() action: number;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  fileGroup: string;
  filesCount: number[] = [];

  text: string;
  formModel: FormGroup;

  uploadFlag: boolean = false;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  ngOnInit() {
    this.formModel = new FormGroup({
      title: new FormControl(this.contest ? this.contest.title : null, Validators.required),
      deadline: new FormControl(this.contest ? this.contest.deadline : null, Validators.required),
      amount: new FormControl(this.contest ? this.contest.amount : null, Validators.required),
      prizes: new FormControl(this.contest ? this.contest.prizes : null, Validators.required)
    });
  }

  ngAfterViewInit() {
    if (this.contest==null) {
      const that = this;
      const widget = uploadcare.Widget('#fileGroup');

      widget.onChange(function(value) {
        if (value) {
          value.promise().done(function(info) {
            that.fileGroup = info.cdnUrl;
            that.filesCount = new Array(info.count);
          });
        } else {
          that.fileGroup = '';
        }
      });
    }
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.disableFlag = true;
      this.formModel.value.pics = this.fileGroup;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
