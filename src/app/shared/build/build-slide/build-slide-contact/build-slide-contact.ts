import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../../../auth/auth.service';

import { slideInOutAnimation } from '../../../animations/index';

import { Contact } from '../../../services/contact-service';
import { objectMini, PublicInfo } from '../../../services/shared-service';
import { PeopleService } from '../../../services/people-service';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-contact',
    templateUrl: 'build-slide-contact.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-contact.css']
})

export class BuildSlideContactComponent implements OnInit, OnDestroy {
  @Input() groupId: string;
  @Input() userId: string;
  @Input() newFlag: boolean;
  @Input() groupMode = true;
  @Input() contact: Contact;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus: boolean = false;
  disableFlag: boolean = false;
  uploadFlag: boolean = false;
  formModel: FormGroup;
  file: string;

  members: objectMini[] = [];
  preMembers: objectMini[] = [];
  curretIndex: number;
  publicInfo: PublicInfo;

  subscriptionInfo: Subscription;
  streamRetrieved = false;

  modeArray: string[] = ['General Contact', 'Member Contact']
  mode = 0;

  titleSelect = [
                 'General Contact',
                 'Secretary',
                 'Student Lab',
                 'PI Room',
                 'Student Room',
                ];

  adminFlag: boolean = false;

  constructor(
    private peopleService: PeopleService,
    private authService: AuthService
  ) {
    this.formModel = new FormGroup({
      title: new FormControl(0, Validators.required),
      address: new FormControl(''),
      email: new FormControl(''),
      phone: new FormControl(''),
      fax: new FormControl('')
    });
  }

  ngOnInit() {
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])
      if (this.adminFlag && this.newFlag) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
    });

    if (!this.newFlag) {
      this.formModel.setValue({
        title: this.contact.title,
        address: this.contact.address,
        email: this.contact.email,
        phone: this.contact.phone,
        fax: this.contact.fax
      });

      if (this.contact.mode == 1) { this.preMembers = [this.contact.member]; }

      this.mode = this.contact.mode;
    }

  }

  ngAfterViewInit() {
    const that = this;
    const widget = uploadcare.Widget('#file');

    if (!this.newFlag) { widget.value(this.contact.pic); }

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
    if (this.formModel.valid && (this.mode == 0 || (this.formModel.value.member != undefined && this.formModel.value.member[0] != -1))) {

      if (this.groupMode) { this.formModel.value.member = this.members[this.formModel.controls['member'].value[0]]; }
      if (this.file) { this.formModel.value.pic = this.file; }
      this.formModel.value.mode = this.mode;
      this.disableFlag = true;
      this.update.emit(this.formModel.value);

    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  changeMode(newMode: number) {
    if (this.newFlag) {
      this.mode = newMode;
      this.submitStatus = false;
    }
  }

  membersFunc(event) {
    this.members = event;
    this.subscriptionInfo = this.formModel.controls['member'].valueChanges.subscribe(data => {
      this.changeId(data[0])
    })
  }

  async changeId(newIndex: number) {
    this.streamRetrieved = false;

    this.publicInfo = await this.peopleService.getPublicInfo(this.members[newIndex]._id);

    this.streamRetrieved = true;
    this.formModel.controls['address'].setValue(this.publicInfo.address ? this.publicInfo.address : '');
    this.formModel.controls['email'].setValue(this.publicInfo.email ? this.publicInfo.email : '');
    this.formModel.controls['phone'].setValue(this.publicInfo.phone ? this.publicInfo.phone : '');
    this.formModel.controls['fax'].setValue(this.publicInfo.fax ? this.publicInfo.fax : '');
  }

  ngOnDestroy() {
    if (this.subscriptionInfo) this.subscriptionInfo.unsubscribe();
  }

}
