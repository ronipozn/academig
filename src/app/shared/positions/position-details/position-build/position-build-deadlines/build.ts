import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { OpenPosition } from '../../../../../shared/services/position-service';

import { slideInOutAnimation } from '../../../../../shared/animations/index';

import * as moment from 'moment';

@Component({
    selector: 'position-build-slide-deadlines',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class PositionBuildDeadlinesComponent implements OnInit {
  @Input() stepsDates: Date[];
  @Input() stepsEnables: number[];

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus = false;
  controlStatus: boolean[] = [false, false];
  formModel: FormGroup;

  enableSelect = ['Enable'];

  datesRangeValid: boolean = null;
  datesBeforeValid: boolean = null;

  constructor(
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private router: Router,
  ) { }

  ngOnInit() {
    this.formModel = new FormGroup({
      // refereesDeadline: new FormControl(''),
      submissionDeadline: new FormControl(this.datepipe.transform(this.stepsDates[0], 'yyyy-MM-dd')),
      // firstAnswers: new FormControl(this.datepipe.transform(this.stepsDates[1], 'yyyy-MM-dd')),

      // videoEnable: new FormArray([ new FormControl(this.stepsEnables[0]) ]),
      // videoInterviewsStart: new FormControl(this.datepipe.transform(this.stepsDates[2], 'yyyy-MM-dd'), Validators.required),
      // videoInterviewsEnd: new FormControl(this.datepipe.transform(this.stepsDates[3], 'yyyy-MM-dd')),
      // videoAnswers: new FormControl(this.datepipe.transform(this.stepsDates[4], 'yyyy-MM-dd')),

      // visitingEnable: new FormArray([ new FormControl(this.stepsEnables[1]) ]),
      // visitingInterviewsStart: new FormControl(this.datepipe.transform(this.stepsDates[5], 'yyyy-MM-dd'), Validators.required),
      // visitingInterviewsEnd: new FormControl(this.datepipe.transform(this.stepsDates[6], 'yyyy-MM-dd')),

      finalAnswers: new FormControl(this.datepipe.transform(this.stepsDates[7], 'yyyy-MM-dd')),
      startDate: new FormControl(this.datepipe.transform(this.stepsDates[8], 'yyyy-MM-dd'))
    });

    this.controlStatusFunc(false, 2);
    this.controlStatusFunc(false, 6);
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  controlStatusFunc(event, i: number) {
    this.controlStatus[i] = event

    if (event == false) {

      const datesArray: string[] = [];

      const jobDeadlineDate = this.formModel.controls['submissionDeadline'].value ? moment(this.formModel.controls['submissionDeadline'].value).format("YYYY-MM-DD") : null;
      const jobFinalAnswersDate = this.formModel.controls['finalAnswers'].value ? moment(this.formModel.controls['finalAnswers'].value).format("YYYY-MM-DD") : null;
      const jobStartDate = this.formModel.controls['startDate'].value ? moment(this.formModel.controls['startDate'].value).format("YYYY-MM-DD") : null;

      if (jobDeadlineDate) datesArray.push(jobDeadlineDate)
      if (jobFinalAnswersDate) datesArray.push(jobFinalAnswersDate)
      if (jobStartDate) datesArray.push(jobStartDate)


      // if (this.formModel.controls['submissionDeadline'].value) { datesArray.push(this.formModel.controls['submissionDeadline'].value) }
      // if (this.formModel.controls['firstAnswers'].value) { datesArray.push(this.formModel.controls['firstAnswers'].value) }

      // if (this.formModel.controls['videoEnable'].value[0]) {
      //   datesArray.push(this.formModel.controls['videoInterviewsStart'].value)
      //   if (this.formModel.controls['videoInterviewsEnd'].value) { datesArray.push(this.formModel.controls['videoInterviewsEnd'].value) }
      //   if (this.formModel.controls['videoAnswers'].value) { datesArray.push(this.formModel.controls['videoAnswers'].value) }
      // }

      // if (this.formModel.controls['visitingEnable'].value[0]) {
      //   datesArray.push(this.formModel.controls['visitingInterviewsStart'].value)
      //   if (this.formModel.controls['visitingInterviewsEnd'].value) { datesArray.push(this.formModel.controls['visitingInterviewsEnd'].value) }
      // }

      // if (this.formModel.controls['finalAnswers'].value) { datesArray.push(this.formModel.controls['finalAnswers'].value) }
      // if (this.formModel.controls['startDate'].value) { datesArray.push(this.formModel.controls['startDate'].value) }

      const datesArraySort = Array.prototype.slice.call(datesArray).sort() // sort and nonMutating

      this.datesRangeValid = (JSON.stringify(datesArray) == JSON.stringify(datesArraySort))

      // if (i == 2) {
      //   this.formModel.controls['videoEnable'].value[0] ?
      //     (this.formModel.controls['videoInterviewsStart'].enable(),
      //      this.formModel.controls['videoInterviewsEnd'].enable(),
      //      this.formModel.controls['videoAnswers'].enable()) :
      //     (this.formModel.controls['videoInterviewsStart'].disable(),
      //      this.formModel.controls['videoInterviewsEnd'].disable(),
      //      this.formModel.controls['videoAnswers'].disable())
      //
      // } else if (i == 6) {
      //   this.formModel.controls['visitingEnable'].value[0] ?
      //     (this.formModel.controls['visitingInterviewsStart'].enable(),
      //      this.formModel.controls['visitingInterviewsEnd'].enable()) :
      //     (this.formModel.controls['visitingInterviewsStart'].disable(),
      //      this.formModel.controls['visitingInterviewsEnd'].disable())
      // }

      if (moment(jobDeadlineDate).isBefore() || moment(jobFinalAnswersDate).isBefore() || moment(jobStartDate).isBefore()) {
        this.datesBeforeValid = false;
      } else {
        this.datesBeforeValid = true;
      }
    }
  }

}
