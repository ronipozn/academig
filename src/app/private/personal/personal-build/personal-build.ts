import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CustomValidators } from 'ng2-validation';

import {PersonalInfo} from '../../../shared/services/private-service';

import {slideInOutAnimation} from '../../../shared/animations/index';

declare var uploadcare: any;

@Component({
    selector: 'personal-build',
    templateUrl: 'personal-build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['personal-build.css']
})

export class PrivatePersonalBuildComponent implements OnInit {
  @Input() headline: string;
  @Input() userId: string;
  @Input() personalInfo: PersonalInfo;
  @Input() name: string;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus = false;

  formModel: FormGroup;

  // fileGroup: string;
  // filesCount: number[]= [];

  constructor(
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.formModel = new FormGroup({
      phone: new FormControl(this.personalInfo.phone),
      address: new FormControl(this.personalInfo.address),
      birthday: new FormControl(this.datepipe.transform(this.personalInfo.birthday, 'yyyy-MM-dd')),
    });

    // this.formModel.addControl("kids", new FormControl());
    this.formModel.addControl('name', new FormArray([new FormControl()]));

    // this.fileGroup = this.personalInfo.kids[0].pic;
    // this.filesCount = new Array(this.personalInfo.kids.length);
  }

  // ngAfterViewInit() {
  //   var that = this;
  //   var widget = uploadcare.Widget('#fileGroup');
  //
  //   widget.onChange(function(value) {
  //     if (value) {
  //       value.promise().done(function(info) {
  //         that.fileGroup = info.cdnUrl;
  //         that.filesCount = new Array(info.count);
  //       });
  //     } else {
  //       that.fileGroup = '';
  //     }
  //   });
  // }

  onSubmit() {
    if (this.formModel.valid) {
      // this.formModel.value.kids = this.fileGroup;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    // if (this.picComponent) {
    //   for (var _i = 0; _i < this.picComponent.responses.length; _i++) {
    //     if (this.picComponent.responses[_i].data.delete_token) {
    //       this.picComponent.deleteImage(this.picComponent.responses[_i].data,_i)
    //     }
    //   }
    // };

    this.cancel.emit(false);
  }

}
