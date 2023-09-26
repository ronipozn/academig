import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { CustomValidators } from 'ng2-validation';

import { slideInOutAnimation } from '../../../../shared/animations/index';
import { Affiliation } from '../../../../shared/services/shared-service';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-affiliation',
    templateUrl: 'build-slide-affiliation.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-affiliation.css']
})

export class BuildSlideAffiliationComponent implements OnInit {
  @Input() affilation: Affiliation;
  @Input() newFlag: boolean;
  @Input() itemId: string;
  @Input() abbrFlag = true;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <{title: string, description: string, externalLink: string, pic: string}> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;
  uploadFlag: boolean = false;
  file: string;

  constructor( ) {
    this.formModel = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      source: new FormControl('', CustomValidators.url),
      externalLink: new FormControl('', CustomValidators.url),
    });
  }

  ngOnInit() {
    if (this.abbrFlag) { this.formModel.addControl('abbr', new FormControl('', Validators.required)); }

    if (!this.newFlag) {
      this.formModel.controls['title'].setValue(this.affilation.title);
      this.formModel.controls['description'].setValue(this.affilation.description);
      this.formModel.controls['source'].setValue(this.affilation.source);
      this.formModel.controls['externalLink'].setValue(this.affilation.externalLink);
      if (this.abbrFlag) { this.formModel.controls['abbr'].setValue(this.affilation.abbr); }
    }

    this.formModel.controls['externalLink'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['externalLink'].setValue(value.trim(), {emitEvent: false});
    });
  }

  ngAfterViewInit() {
    const that = this;
    const widget = uploadcare.Widget('#file');

    if (!this.newFlag) { widget.value(this.affilation.pic); }

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
      this.formModel.value.pic = (this.file) ? this.file : ((this.newFlag) ? null : this.affilation.pic) ;
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
