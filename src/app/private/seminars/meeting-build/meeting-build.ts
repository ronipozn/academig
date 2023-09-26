import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import {Subscription} from 'rxjs/Subscription';

import { objectMini, ValidatorsService } from '../../../shared/services/shared-service';
import { settingsMeetings } from '../../../shared/services/seminars-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

import * as moment from 'moment';

function startDateValidator(control: FormControl): {[key: string]: any} {
  const value: string = control.value || '';
  let valid: boolean;
  // console.log('value',value)

  if (!value || moment(value).isAfter(moment(), 'day')) { valid = true; }

  return valid ? null : {'start': true};
}

@Component({
    selector: 'meeting-build',
    templateUrl: 'meeting-build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['meeting-build.css']
})

export class PrivateMeetingBuildComponent implements OnInit, OnDestroy {
  @Input() groupId: string;
  @Input() userId: string;
  @Input() newFlag: boolean;

  @Input() settings: settingsMeetings;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  subscriptionOften: Subscription;
  subscriptionFirst: Subscription;
  formModel: FormGroup;

  members: objectMini[] = [];
  preMembers: objectMini[] = [];

  submitStatus = false;
  // durationSelect: string[];

  firstDayTitle: string;
  firstDayFlag = false;

  secondDayTitle: string;
  secondDayFlag = false;

  daySelect = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  daySelectFirst = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  daySelectSecond = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  howOftenSelect = ['Daily', 'Twice a week', 'Weekly', 'Every two weeks', 'Monthly'];
  howAddSelect = ['Randomly', 'By last name'];
  // howAddSelect = ["Randomly", "By last name", "By degree", "Catch"];
  // orderRadio = ["Ascending", "Descending"];

  constructor(
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private router: Router,
    private validatorsService: ValidatorsService,
  ) {

    // this.durationSelect = ["Till end of " + this.datepipe.transform(new Date(), 'MMMM'),
    //                        "Till end of " + new Date().getFullYear(),
    //                        "Till end of " + new Date(new Date().setFullYear(new Date().getFullYear() + 1)).getFullYear()];

    this.daysTitleFunc(2); // init
    this.dayExclude(4, 0); // init

    this.formModel = new FormGroup({
      location: new FormControl('', Validators.required),
      time: new FormControl('09:00', Validators.required),
      start: new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), startDateValidator, Validators.required]),
      end: new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), startDateValidator, Validators.required]),
      // duration: new FormControl(1, Validators.required),
      howOften: new FormControl(2, Validators.required),
      howToAdd: new FormControl(0, Validators.required),
      day: new FormControl(4, Validators.required),
      secondDay: new FormControl(2, Validators.required)
      // order: new FormControl(0, Validators.required)
    });
  }

  ngOnInit() {
    if (!this.newFlag) {
      this.formModel.setValue({
        location: this.settings.location,
        time: this.settings.time,
        start: this.datepipe.transform(this.settings.startDate, 'yyyy-MM-dd'),
        end: this.datepipe.transform(this.settings.endDate, 'yyyy-MM-dd'),
        // duration: this.settings.duration,
        howOften: this.settings.howOften,
        howToAdd: this.settings.howToAdd,
        day: this.settings.day,
        secondDay: this.settings.secondDay,
        // order: this.settings.order,
      });

      this.preMembers = this.settings.participants;
      this.daysTitleFunc(this.settings.howOften); // update
      this.dayExclude(this.settings.day, 0); // update
    }

    this.formModel.controls['start'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['end'].updateValueAndValidity({emitEvent: false});
    });

    this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
    });

    this.subscriptionOften = this.formModel.controls['howOften'].valueChanges.subscribe(data => {
      this.daysTitleFunc(data)
    })

    this.subscriptionFirst = this.formModel.controls['day'].valueChanges.subscribe(data => {
      this.dayExclude(data, 0)
    })

    // this.subscriptionSecond=this.formModel.controls['secondDay'].valueChanges.subscribe(data => {
    //   this.dayExclude(data, 1)
    // })

  }

  daysTitleFunc(mode: number) {
    if (mode == 0) {
      this.firstDayTitle = 'Exclude day';
      this.secondDayTitle = 'Exclude another day';
      this.firstDayFlag = false;
      this.secondDayFlag = false;
    }

    if (mode > 0) {
      this.firstDayTitle = 'Day of the week';
      this.secondDayTitle = 'Second day of the week';
      this.firstDayFlag = true;
      this.secondDayFlag = (mode == 1) ? true : false;
    }
  }

  dayExclude(index: number, mode: number) {
    // console.log('data',index, mode)
    let indexSplice;

    if (mode == 0) {
      // console.log('1',this.daySelectFirst[index])
      this.daySelectSecond = JSON.parse(JSON.stringify(this.daySelect)); // duplicate
      indexSplice = this.daySelectSecond.indexOf(this.daySelectFirst[index]);
      this.daySelectSecond.splice(indexSplice, 1);
    }
    // else {
    //   console.log('2',this.daySelectSecond[index])
    //   this.daySelectFirst = JSON.parse(JSON.stringify(this.daySelect));
    //   indexSplice = this.daySelectFirst.indexOf(this.daySelectSecond[index]);
    //   this.daySelectFirst.splice(indexSplice,1);
    // };
  }

  membersFunc(event) {
    this.members = event;
  }

  onSubmit() {
    this.formModel.value.participants = this.members.filter((elem, index, arr) => this.formModel.value.participants[index] === true);

    if (this.formModel.valid && this.formModel.value.participants.length > 0) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  ngOnDestroy() {
    this.subscriptionOften.unsubscribe();
    this.subscriptionFirst.unsubscribe();
  }

}
