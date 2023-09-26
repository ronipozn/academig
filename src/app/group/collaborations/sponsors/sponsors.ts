import {Component, Input, Output, EventEmitter} from '@angular/core';

import {Sponsor} from '../../../shared/services/collaboration-service';

@Component({
  selector: 'group-collaborations-sponsors',
  templateUrl: 'sponsors.html',
  styleUrls: ['sponsors.css']
})
export class GroupCollaborationsSponsorsComponent {
  @Input() items: Sponsor[] = [];
  @Input() showEditBtn: number;
  @Input() stream: number[];
  @Input() bagName: string;

  @Output() buttonEditClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <number> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  showButton: boolean[] = [];

  buttonOver(showStatus: boolean, i: number) {
    if (this.showEditBtn) {
      this.showButton[i] = showStatus;
    }
  }

  buttonEditFunc(event, i: number): void {
    this.buttonEditClick.emit(i);
  }

  buttonDeleteFunc(event, i: number): void {
    this.buttonDeleteClick.emit(i);
  }

  animationDone(event, i: number): void {
    this.showButton[i] = false;
    this.animationDoneEvent.emit(true);
  }

}
