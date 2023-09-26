import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../../../shared/animations/index';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-quote',
    templateUrl: 'build-slide-quote.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-quote.css']
})

export class BuildSlideQuoteComponent implements OnInit {
  @Input() text: string;
  @Input() name: string;
  @Input() pic: string;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;
  uploadFlag: boolean = false;
  file: string;

  ngOnInit() {
    this.formModel = new FormGroup({
      text: new FormControl(this.text, Validators.required),
      name: new FormControl(this.name, Validators.required),
    });
  }

  ngAfterViewInit() {
    const that = this;
    const widget = uploadcare.Widget('#file');

    if (this.pic) widget.value(this.pic);

    widget.onChange(function(value) {
      if (value) {
        that.uploadFlag = true;
        value.promise().done(function(info) {
          that.file = info.cdnUrl;
          that.uploadFlag = false;
        });
      } else {
        that.file = '';
      }
    });
  }

  onSubmit() {
    if (this.formModel.valid) {
      if (this.file) this.formModel.value.pic = this.file;
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
