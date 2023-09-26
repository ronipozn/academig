import {Component, Input, Output, EventEmitter} from '@angular/core';

import {Funding} from '../../services/funding-service';
import {groupComplex} from '../../services/shared-service';

@Component({
  selector: 'fundings-list',
  templateUrl: 'fundings-list.html'
})
export class FundingsListComponent {
  @Input() fundings: Funding[] = [];
  @Input() groupStage: number;
  @Input() sourceType: number;
  @Input() itemFocus: number;
  @Input() showEditBtn: number;
  @Input() planNumber = 2;
  @Input() activeId: string;
  @Input() bagName: string;
  @Input() userGroups: groupComplex[];

  @Input() streamRetrieved: boolean;
  @Input() stream: number[];
  @Input() streamRole: number[][];
  @Input() streamSuggestion: number[];

  @Output() buttonEditClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number[]> = new EventEmitter()

  // Pay attention that ID is emitted here and not the index
  @Output() buttonGroupAddClick: EventEmitter <{'groupId': string, 'index': number}> = new EventEmitter();
  @Output() buttonGroupDeleteClick: EventEmitter <{'groupId': string, 'index': number}> = new EventEmitter();

  @Output() buttonRoleAddClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonRoleApproveClick: EventEmitter <[number, number]> = new EventEmitter();
  @Output() buttonRoleDeclineClick: EventEmitter <[number, number]> = new EventEmitter();
  @Output() buttonRoleEditClick: EventEmitter <[number, number]> = new EventEmitter();
  @Output() buttonRoleLeaveClick: EventEmitter <[number, number]> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  buttonEditFunc(index: number): void {
    this.buttonEditClick.emit(index);
  }

  buttonDeleteFunc(index: number): void {
    this.buttonDeleteClick.emit(index);
  }

  buttonSuggestionFunc(action: number, index: number): void {
    this.buttonSuggestionClick.emit([index, action]);
  }


  buttonGroupAddFunc(event, index: number): void {
    this.buttonGroupAddClick.emit({'groupId': event, 'index': index});
  }

  buttonGroupDeleteFunc(event, index: number): void {
    this.buttonGroupDeleteClick.emit({'groupId': event, 'index': index});
  }


  buttonRoleAddFunc(index: number): void {
    this.buttonRoleAddClick.emit(index);
  }

  buttonRoleApproveFunc(event, index: number): void {
    this.buttonRoleApproveClick.emit([event, index]);
  }

  buttonRoleDeclineFunc(event, index: number): void {
    this.buttonRoleDeclineClick.emit([event, index]);
  }

  buttonRoleEditFunc(event, index: number): void {
    this.buttonRoleEditClick.emit([event, index]);
  }

  buttonRoleLeaveFunc(event, index: number): void {
    this.buttonRoleLeaveClick.emit([event, index]);
  }

  animationDone(): void {
    this.animationDoneEvent.emit(true);
  }

}
