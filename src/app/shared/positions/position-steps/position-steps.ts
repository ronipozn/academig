import {Component, Input, OnChanges, EventEmitter, Output} from '@angular/core';

import * as moment from 'moment';

@Component({
  selector: 'position-steps',
  templateUrl: 'position-steps.html',
  styleUrls: ['position-steps.css']
})
export class PositionStepsComponent implements OnChanges {
  @Input() stepsDates: Date[];
  @Input() activeStep: number;
  @Input() showEditBtn: boolean = false;

  // @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();

  stepsStatus: string[] = [];

  stepsText: string[] = [
                         'Submission deadline',
                         'Submission answers',
                         'Online interviews - Start',
                         'Online interviews - End',
                         'Online interviews answers',
                         'In-person interviews - Start',
                         'In-person interviews - End',
                         'Final decision date',
                         'Start date'
                        ];

  activeStepsDate: Date[] = [];
  activeStepsText: string[] = [];
  activeStepsStatus: string[] = [];

  // Send Referee Letters step

  // btnEditFunc() {
  //   this.buttonEditClick.emit(true);
  // }

  ngOnChanges() {
    let active: number;

    this.activeStepsText = [];
    this.activeStepsDate = [];
    this.activeStepsStatus = [];

    for (let i = 0; i < this.stepsDates.length; i++) {
      if (this.stepsDates[i]) {
        if (moment(moment()).isBefore(this.stepsDates[i])) {
          active = i;
          break;
        }
      }
    }


    for (let i = 0; i < this.stepsDates.length; i++) {
      if (this.stepsDates[i]) {
        this.activeStepsText.push(this.stepsText[i]);
        this.activeStepsDate.push(this.stepsDates[i]);
        this.activeStepsStatus.push((i == active) ? ('active') : (i < active ? 'complete' : 'disabled'));
        // this.activeStepsStatus.push((i==this.activeStep) ? ("active") : (i<this.activeStep ? "complete" : "disabled"))
      }
    }

    // console.log('activeStepsStatus',this.activeStepsStatus)
  }
}
