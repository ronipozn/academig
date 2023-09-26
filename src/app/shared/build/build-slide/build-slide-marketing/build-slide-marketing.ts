import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

import {complexName} from '../../../services/shared-service';
import {MarketingItem} from '../../../services/admin-service';
import { slideInOutAnimation } from '../../../../shared/animations/index';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-marketing',
    templateUrl: 'build-slide-marketing.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-marketing.css']
})

export class BuildSlideMarketingComponent implements OnInit {
  @Input() marketing: MarketingItem;
  @Input() mode: number; // 0 - Profile
                         // 1 - Group
                         // 2 - Department
                         // 3 - University

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  uploadFlag: boolean = false;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  // file1: string;
  // file2: string;

  item: string[] = ['Profile','Lab','Department','University']
  emailType: string[] = ['1. Lab Created', '2. Tools', '3. Reminder']

  ngOnInit() {
    console.log('this.marketing',this.marketing)
    if (this.marketing) {
      this.formModel = new FormGroup({
        // url: new FormControl(this.marketing.url, [Validators.required, CustomValidators.url]),
        text: new FormControl(this.marketing.text),
      });
    } else {
      this.formModel = new FormGroup({
        // url: new FormControl(null, [Validators.required, CustomValidators.url]),
        text: new FormControl(''),
      });
    }
  }

  // ngAfterViewInit() {
  //   const that = this;
  //   that.uploadFlag = true;
  //
  //   const widget1 = uploadcare.Widget('#file1');
  //   widget1.onChange(function(value) {
  //     if (value) {
  //       value.promise().done(function(info) {
  //         that.file2 = info.cdnUrl;
  //       });
  //     } else {
  //       that.file2 = '';
  //     }
  //   });
  //
  //   if (this.counter>0) {
  //     widget1.value(this.marketing.pics[0]);
  //     this.formModel.value.pics = [this.marketing.pics[0],this.marketing.pics[1]];
  //   };
  // }

  onSubmit() {
    if (this.formModel.valid) {
      // this.formModel.value.pics = [this.file1, this.file2];
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
