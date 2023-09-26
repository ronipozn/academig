import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {OpenPosition} from '../../services/position-service';
import {titlesTypes} from '../../services/people-service';
import {groupComplex} from '../../services/shared-service';

import * as moment from 'moment';

@Component({
  selector: 'position-item',
  templateUrl: 'position-item.html'
})
export class PositionItemComponent implements OnInit {
  @Input() position: OpenPosition;
  @Input() sourceType: number;
  @Input() userStatus: number;
  @Input() showEditBtn: number;

  @Input() stream: number;
  @Input() streamFollow: number;
  @Input() streamSuggestion: number = 0;

  @Input() groupIndex: groupComplex;

  @Output() buttonApplyClick: EventEmitter <number> = new EventEmitter();

  @Output() buttonAcceptClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonRejectClick: EventEmitter <boolean> = new EventEmitter();

  // @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonFollowClick: EventEmitter <boolean> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  deadlineDays: number;
  createdDays: number;

  titlesTypes = titlesTypes;
  lengthSelect = ['Months', 'Years'];
  typeSelect = ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"];

  ngOnInit() {
    this.deadlineDays = (this.position.stepsDates && this.position.stepsDates[0]) ? moment(this.position.stepsDates[0]).diff(moment(), 'days') : null;
    this.createdDays = (this.position.created_on) ? moment().diff(moment(this.position.created_on), 'days') : null;
  }

  buttonFollowFunc() {
    this.buttonFollowClick.emit(true);
  }

  buttonAccpetFunc() {
    this.buttonAcceptClick.emit(true);
  }

  buttonRejectFunc() {
    this.buttonRejectClick.emit(true);
  }

  buttonApplyFunc(i: number) {
    this.buttonApplyClick.emit(i);
  }

  animationDone() {
    this.animationDoneEvent.emit(true);
  }

}
