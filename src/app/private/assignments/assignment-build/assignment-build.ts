import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { settingsReports } from '../../../shared/services/private-service';
import { People } from '../../../shared/services/people-service';
import { objectMini } from '../../../shared/services/shared-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

@Component({
    selector: 'assignment-build',
    templateUrl: 'assignment-build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['assignment-build.css']
})

export class PrivateAssignmentBuildComponent implements OnInit {
  @Input() groupId: string;
  @Input() userId: string;
  @Input() newFlag: boolean;
  @Input() settings: settingsReports;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  whoSee: People[] = [];
  preWhoSee: objectMini[] = [];

  participants: People[] = [];
  preParticipants: objectMini[] = [];

  submitStatus = false;

  formModel: FormGroup;

  durationSelect: string[];

  howOftenSelect = ['Weekly', 'Every two weeks', 'Monthly'];
  daySelect = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
      private route: ActivatedRoute,
      private datepipe: DatePipe,
      private router: Router
    ) {

      const currentDate = new Date();

      this.durationSelect = ['Indefinitely',
                             'Till end of ' + this.datepipe.transform(new Date(), 'y'),
                             'Till end of ' + this.datepipe.transform(new Date(), 'MMMM'),
                             ];

      this.formModel = new FormGroup({
        howOften: new FormControl(1, Validators.required),
        duration: new FormControl(0, Validators.required),
        day: new FormControl(3, Validators.required),
        time: new FormControl('09:00', Validators.required),
      });

    }

  ngOnInit() {
    if (!this.newFlag) {
      this.formModel.setValue({
        howOften: this.settings.howOften,
        duration: this.settings.duration,
        day: this.settings.day,
        time: this.settings.time,
      });

      this.preWhoSee = this.settings.whoSee;
      this.preParticipants = this.settings.whoSubmit;
    }
  }

  whoFunc(event) {
    this.whoSee = event;
  }

  participantsFunc(event) {
    this.participants = event;
  }

  onSubmit() {
    this.formModel.value.whoSee = this.whoSee.filter((elem, index, arr) => this.formModel.value.whoSee[index] === true);
    this.formModel.value.participants = this.participants.filter((elem, index, arr) => this.formModel.value.participants[index] === true);
    this.formModel.value.participants.forEach(function(participant) { participant.submitStatus = 0; });

    if (this.formModel.valid && this.formModel.value.whoSee.length > 0 && this.formModel.value.participants.length > 0) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }


}
