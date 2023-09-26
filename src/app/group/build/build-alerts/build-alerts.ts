import {Component, Input, OnInit, OnChanges, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Subscription} from 'rxjs/Subscription';

import * as moment from 'moment';

@Component({
    selector: 'group-build-alerts',
    templateUrl: 'build-alerts.html'
})
export class GroupBuildAlertsComponent implements OnInit, OnChanges {
  @Input() previewStatus: number;
  @Input() showEditBtn: boolean;
  @Input() emailVerified: boolean[]; // [Personal Email, Institute Email]
  @Input() groupStage: number;
  @Input() userStatus: number;
  @Input() onBehalf: number;
  @Input() groupId: string;
  @Input() openDate: Date;
  @Input() submitDate: Date;

  @Input() approveStream: boolean;
  @Input() rejectStream: boolean;
  @Input() controlStream: boolean;

  @Output() approveClick: EventEmitter <boolean> = new EventEmitter();
  @Output() rejectClick: EventEmitter <boolean> = new EventEmitter();
  @Output() controlClick: EventEmitter <boolean> = new EventEmitter();

  @Output() changeUserStatusDummy: EventEmitter <number> = new EventEmitter();

  @Output() changeStage: EventEmitter <number> = new EventEmitter();

  subscription: Subscription;
  currentGroupId: string;
  subscribeFlag: boolean = false;

  _hoursString: string;
  _minutesString: string;

  labFlag: boolean = true;

  togglePreviewFunc() {
    this.changeUserStatusDummy.emit();
  }

  approveFunc() {
    this.approveClick.emit();
  }

  rejectFunc() {
    this.rejectClick.emit();
  }

  controlModalFunc() {
    this.controlClick.emit();
  }

  changeStageFunc(i: number) {
    this.changeStage.emit(i);
  }

  updatePage() {
    // if (this.groupStage == 1 || this.groupStage == -1) {
    if (this.groupStage == -1) {

      const deadline = (this.groupStage == -1) ? moment(this.openDate).add(2, 'days') : moment(this.submitDate).add(2, 'days');
      let duration;
      let hours;

      this.subscription = Observable.interval(1000).map((x) => {
        duration = moment.duration(deadline.diff(moment()));
      }).subscribe((x) => {
        hours = Math.floor(duration.asHours()).toFixed(0);
        this._hoursString = (hours == 0) ? '' : hours + (((duration.hours() > 1) ? ' hours ' : ' hour ') + 'and ')
        this._minutesString = duration.minutes() + ((duration.minutes() > 1) ? ' minutes' : ' minute')
      });

      this.currentGroupId = this.groupId;
      this.subscribeFlag = true;

    }
  }

  ngOnInit() {
    this.labFlag = !(this.onBehalf==4 || this.onBehalf==5 || this.onBehalf==7);
  }

  ngOnChanges() {
    if (this.subscribeFlag == true && this.currentGroupId != this.groupId) {
      this.subscribeFlag = false;
      // this.subscription.unsubscribe();
    } else {
      this.updatePage();
    }
  }

  ngOnDestroy() {
    if (this.subscribeFlag == true) this.subscription.unsubscribe();
  }

}
