import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { currentReport, peopleReport } from '../../../shared/services/private-service';
import { People } from '../../../shared/services/people-service';
import { objectMini } from '../../../shared/services/shared-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

@Component({
    selector: 'single-assignment-build',
    templateUrl: 'single-assignment-build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['single-assignment-build.css']
})

export class PrivateSingleAssignmentBuildComponent implements OnInit {
  @Input() groupId: string;
  @Input() userId: string;
  @Input() extendFlag: boolean;

  @Input() report: currentReport;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;

  submitStatus = false;

  whoSee: People[] = [];
  preWhoSee: objectMini[] = [];

  participants: People[] = [];
  preParticipants: peopleReport[] = [];

  constructor(
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private router: Router,
  ) { }

  ngOnInit() {
    this.formModel = new FormGroup({
      time: new FormControl(this.datepipe.transform(this.report.submissionDate, 'HH:mm'), Validators.required),
      date: new FormControl(this.datepipe.transform(this.report.submissionDate, 'yyyy-MM-dd'), Validators.required),
    });

    this.preWhoSee = this.report.whoSee;
    this.preParticipants = this.report.whoSubmit;
  }

  whoFunc(event) {
    this.whoSee = event;
  }

  participantsFunc(event) {
    this.participants = event;
  }

  onSubmit() {
    if (this.formModel.valid) {
      if (this.extendFlag) {
        this.formModel.value.whoSee =  this.preWhoSee;
        this.formModel.value.participants = this.preParticipants;
      } else {
        this.formModel.value.whoSee = this.whoSee.filter((elem, index, arr) => this.formModel.value.whoSee[index] === true);
        this.formModel.value.participants = this.participants.filter((elem, index, arr) => this.formModel.value.participants[index] === true);
        this.formModel.value.participants.forEach(function(participant) { participant.submitStatus = 0; });
      }
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
