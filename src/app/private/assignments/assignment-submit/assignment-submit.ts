import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../../shared/animations/index';

import { peopleReport } from '../../../shared/services/private-service';

declare var uploadcare: any;

@Component({
    selector: 'assignment-submit',
    templateUrl: 'assignment-submit.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['assignment-submit.css']
})

export class PrivateAssignmentSubmitComponent implements OnInit {
  @Input() groupId: string;
  @Input() userId: string;
  @Input() newFlag: boolean;
  @Input() submission: peopleReport;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;
  file: string;

  constructor( ) {
    this.formModel = new FormGroup({
      title: new FormControl('', Validators.required),
      current: new FormControl(''),
      next: new FormControl(''),
      delay: new FormControl(''),
    });
  }

  ngOnInit() {
    if (!this.newFlag) {
      this.formModel.setValue({
        title: this.submission.title,
        current: this.submission.current,
        next: this.submission.next,
        delay: this.submission.delay,
        file: this.submission.file,
      });
    }
  }

  ngAfterViewInit() {
    const that = this;
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
  }

  onSubmit() {
    if (this.formModel.valid && this.file) {
      this.formModel.value.file = this.file;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
