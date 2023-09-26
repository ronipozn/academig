import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { AuthService } from '../../../../auth/auth.service';
import { SharedService } from '../../../services/shared-service';
import { slideInOutAnimation } from '../../../animations/index';

declare var uploadcare: any;
declare var uploadcareTabEffects: any;

@Component({
    selector: 'build-slide-text-pic',
    templateUrl: 'build-slide-text-pic.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-text-pic.css']
})

export class BuildSlideTextPicComponent implements OnInit {
  @Input() title: string;
  @Input() text: string;
  @Input() caption: string;
  @Input() pic: string;
  @Input() picValue = 'picture';
  @Input() type: number = 0;
  @Input() itemId: string;
  @Input() aiFlag: boolean = false;

  @Input() nameRequired: boolean = true;
  @Input() captionFlag: boolean = false;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <{'pic': string, 'text': string}> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;
  uploadFlag: boolean = false;
  file: string;
  // groupFiles: string[];

  imgType: string[]= ['free, 16:9, 4:3, 5:4, 1:1', '112x112 upscale', '240x120 upscale'];

  adminFlag: boolean = false;

  constructor(
    private sharedService: SharedService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])
      if (this.adminFlag && this.aiFlag) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
    });

    this.formModel = new FormGroup({
      text: new FormControl(this.text ? this.text : '', this.nameRequired ? Validators.required : null),
      caption: new FormControl(this.caption ? this.caption : '')
    });

    this.file = this.pic;

    if (this.captionFlag) {
      this.formModel.addControl('caption', new FormControl(this.caption ? this.caption : ''));
      if (this.pic) {
        this.formModel.controls['caption'].enable()
      } else {
        this.formModel.controls['caption'].disable()
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
