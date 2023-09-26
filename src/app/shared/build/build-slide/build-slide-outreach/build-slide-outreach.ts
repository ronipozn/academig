import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CustomValidators } from 'ng2-validation';
import { DomSanitizer } from '@angular/platform-browser';

import { AuthService } from '../../../../auth/auth.service';
import { slideInOutAnimation } from '../../../../shared/animations/index';
import { SharedService } from '../../../services/shared-service';

import { objectMini, ValidatorsService } from '../../../../shared/services/shared-service';
import { Outreach } from '../../../../shared/services/outreach-service';

declare var uploadcare: any;
declare var uploadcareTabEffects: any;

@Component({
    selector: 'build-slide-outreach',
    templateUrl: 'build-slide-outreach.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-outreach.css']
})

export class BuildSlideOutreachComponent implements OnInit {
  @Input() groupId: string;
  @Input() userId: string;
  @Input() newFlag: boolean;

  @Input() outreach: Outreach;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  members: objectMini[] = [];
  adminFlag: boolean = false;

  uploadFlag: boolean = false;
  file: string;

  url: any;
  urlValid: boolean = false;
  linkConvert: string;

  constructor(private datepipe: DatePipe,
              private sanitizer: DomSanitizer,
              private sharedService: SharedService,
              private authService: AuthService,
              private validatorsService: ValidatorsService) {
    this.formModel = new FormGroup({
      title: new FormControl(null, Validators.required),
      location: new FormControl(null),
      description: new FormControl(null),
      link: new FormControl(null, CustomValidators.url),
      caption: new FormControl(null),
      clip: new FormControl(null, CustomValidators.url),
    });
  }

  ngOnInit() {
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])
      if (this.adminFlag && this.newFlag && this.groupId) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
    });

    if (!this.newFlag) {
      this.formModel.controls['title'].setValue(this.outreach.name);
      this.formModel.controls['location'].setValue(this.outreach.location);
      this.formModel.controls['link'].setValue(this.outreach.link);
      this.formModel.controls['caption'].setValue(this.outreach.caption);
      this.formModel.controls['clip'].setValue(this.outreach.clip);
      this.formModel.controls['description'].setValue(this.outreach.description);
    }

    this.formModel.addControl('start', (this.newFlag) ?
                              new FormControl('', [this.validatorsService.rangeValidator({'range': ''})]) :
                              new FormControl(this.datepipe.transform(this.outreach.period.start, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''})]));

    this.formModel.addControl('end', (this.newFlag) ?
                              new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                              new FormControl(this.datepipe.transform(this.outreach.period.end, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

    this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
    });

    this.formModel.addControl('active',
      new FormArray([ new FormControl(this.newFlag ? true : (this.outreach.period.mode==2)) ]),
    );

    this.file = !this.newFlag ? this.outreach.pic : null;

    this.formModel.addControl('caption', new FormControl((!this.newFlag && this.outreach.caption) ? this.outreach.caption : ''));

    if (!this.newFlag && this.outreach.pic) {
      this.formModel.controls['caption'].enable()
    } else {
      this.formModel.controls['caption'].disable()
    }

    this.controlStatusFunc(false, 0);
  }

  // membersFunc(event) {
  //   this.members = event;
  // }

  onSubmit() {
    if (this.formModel.valid) {
      this.disableFlag = true;
      if (this.file) this.formModel.value.pic = this.file;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  controlStatusFunc(flag: boolean, mode: number) {
    if (mode==0) {
      if (flag==false) {
        this.formModel.controls['active'].value[0] ? this.formModel.controls['end'].disable() : this.formModel.controls['end'].enable();
      }
    } else if (mode==1) {
      if (this.formModel.value.clip) {
        this.linkConvert = this.sharedService.convertMedia(this.formModel.value.clip);
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.linkConvert);
        this.urlValid = (this.linkConvert == '') ? false : true;
      }
    }
  }

  async ngAfterViewInit() {
    const groupIdFlag = this.file ? this.file.slice(-6).substring(0, 3) : null;
    if (groupIdFlag == 'nth') {
      const groupFile: string = await this.sharedService.queryUploadcareGroupInfo(this.file);
      this.loadWidget(groupFile)
    } else {
      this.loadWidget(this.file)
    }
  }

  loadWidget(pic: string) {
    const that = this;

    uploadcare.registerTab('preview', uploadcareTabEffects)
    const widget = uploadcare.Widget('#file');

    if (pic) {
      widget.value(pic);
    }

    widget.onChange(function(value) {
      if (value) {
        that.uploadFlag = true;
        that.formModel.controls['caption'].enable()
        value.promise().done(function(info) {
          that.file = info.cdnUrl;
          that.uploadFlag = false;
        });
      } else {
        that.file = '';
        that.formModel.controls['caption'].disable()
      }
    });
  }

}
