import {Component, Input, OnChanges, Output, EventEmitter} from '@angular/core';

import {PersonalInfo} from '../../../shared/services/private-service';

@Component({
  selector: 'private-personal-item',
  templateUrl: 'personal-item.html',
  styleUrls: ['personal-item.css']
})
export class PrivatePersonalItemComponent implements OnChanges {
  @Input() personalInfo: PersonalInfo;
  @Input() profileName: string;
  @Input() profileId: string;
  @Input() userId: string;
  @Input() sourceType: number; // 0 - lab, 1 - wall
  @Input() streamRetrieved: boolean;
  @Input() streamInfo: number;
  @Input() streamKid: number[];

  @Output() buttonMessageClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonInfoClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @Output() buttonKidEditClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonKidDeleteClick: EventEmitter <number> = new EventEmitter();
  @Output() animationKidDoneEvent: EventEmitter <number> = new EventEmitter();

  meFlag: boolean; // profile match active user Flag

  constructor() {}

  ngOnChanges() {
    this.meFlag = (this.userId == this.profileId)
  }

  buttonMessgeFunc(): void {
    this.buttonMessageClick.emit(true);
  }

  buttonInfoFunc(): void {
    this.buttonInfoClick.emit(true);
  }

  animationDone(): void {
    this.animationDoneEvent.emit(true);
  }

  buttonKidEditFunc(i: number): void {
    this.buttonKidEditClick.emit(i);
  }

  buttonKidDeleteFunc(i: number): void {
    this.buttonKidDeleteClick.emit(i);
  }

  animationKidDone(i: number): void {
    this.animationKidDoneEvent.emit(i);
  }


}
