import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import * as moment from 'moment';

import { privateMeeting } from '../../../shared/services/seminars-service';
import { objectMini } from '../../../shared/services/shared-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

declare var uploadcare: any;

export const dateValidator = (pDate: Date, nDate: Date) => {
  return (control: FormControl) => {
    // var num: Date;

    if (pDate && nDate) {
      if (moment(control.value).isBetween(moment(pDate), moment(nDate), 'day', '()')) {
        return null;
      };
    } else if (pDate) {
      if (moment(control.value).isAfter(moment(pDate), 'day')) {
        return null;
      };
    } else if (nDate) {
      if (moment(control.value).isBefore(moment(nDate), 'day')) {
        return null;
      };
    }
    return {value: {valid: false}};
  };
};

@Component({
    selector: 'single-meeting-build',
    templateUrl: 'single-meeting-build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['single-meeting-build.css']
})

export class PrivateSingleMeetingBuildComponent implements OnInit {
  @Input() groupId: string;
  @Input() userId: string;
  @Input() newFlag: boolean;

  @Input() meeting: privateMeeting;

  @Input() previousDate: Date;
  @Input() nextDate: Date;
  @Input() mode: number; // 0 - first Meeting
                         // 1 - somewhere between
                         // 2 - last Meeting

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  stepNum: number;

  submitStatus = false;

  members: objectMini[] = [];
  preMembers: objectMini[] = [];

  previousDatePlus: Date;
  nextDateMinus: Date;

  uploadFlag = false;
  files: string;

  constructor(
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private router: Router,
  ) { }

  ngOnInit() {
    this.stepNum = 0;

    // console.log('meeting',this.meeting)

    this.previousDatePlus = moment(this.previousDate).add(1, 'days').toDate();
    this.nextDateMinus = moment(this.nextDate).add(-1, 'days').toDate();

    this.formModel = new FormGroup({
      location: new FormControl(''),
      time: new FormControl(this.datepipe.transform(new Date(0, 0, 0, 9, 0), 'HH:mm'), Validators.required),
      date: new FormControl(this.datepipe.transform(new Date(), 'yyyy-MM-dd'), dateValidator(this.previousDate, this.nextDate)),
      topic: new FormControl(''),
      files: new FormControl(''),
    });

    if (!this.newFlag) {
      this.formModel.setValue({
        location: this.meeting.location,
        time: this.datepipe.transform(this.meeting.date, 'HH:mm'),
        date: this.datepipe.transform(this.meeting.date, 'yyyy-MM-dd'),
        topic: this.meeting.topic,
        files: this.meeting.files,
      });

      this.preMembers = [this.meeting.presenter];
      this.files = this.meeting.files;
    }
  }

  membersFunc(event) {
    this.members = event;
  }

  ngAfterViewInit() {
    const that = this;
    const widget = uploadcare.Widget('#files');

    widget.value(this.meeting.files);

    widget.onChange(function(value) {
      if (value) {
        that.uploadFlag = true;
        value.promise().done(function(info) {
          that.uploadFlag = false;
          that.files = info.cdnUrl;
        });
      } else {
        that.files = '';
      }
    });
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.formModel.value.files = this.files;
      this.formModel.value.presentor = this.members[this.formModel.controls['presentor'].value[0]]
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
