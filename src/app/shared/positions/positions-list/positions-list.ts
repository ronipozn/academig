import {Component, Input, Output, EventEmitter} from '@angular/core';
import {OpenPosition} from '../../services/position-service';
import {groupComplex} from '../../services/shared-service';

@Component({
  selector: 'positions-list',
  templateUrl: 'positions-list.html',
  styleUrls: ['positions-list.css']
})
export class PositionListComponent {
  @Input() positions: Position[] = [];
  @Input() sourceType: number; // 0 - regular
                               // 1 - wall (DELETED)
                               // 2 - search
                               // 3 - applications
                               // 5 - group AI
  @Input() itemFocus: number;
  @Input() userStatus: number;
  @Input() showEditBtn: boolean;
  @Input() showHeadline = false;
  @Input() groupIndex: groupComplex;

  @Input() streamRetrieved: boolean;
  @Input() stream: number[];
  @Input() streamFollow: number[];
  @Input() streamSuggestion: number[];

  @Output() buildFlag: EventEmitter <boolean> = new EventEmitter(true);
  @Output() buttonApplyClick: EventEmitter <{'action': number, 'index': number}> = new EventEmitter();
  @Output() buttonFollowClick: EventEmitter <number> = new EventEmitter();

  @Output() buttonAcceptClick: EventEmitter <number> = new EventEmitter()
  @Output() buttonRejectClick: EventEmitter <number> = new EventEmitter()

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  positionBuildFlag = false;

  buttonFollowFunc(index: number) {
    this.buttonFollowClick.emit(index);
  }

  buttonAccpetFunc(index: number) {
    this.buttonAcceptClick.emit(index);
  }

  buttonRejectFunc(index: number) {
    this.buttonRejectClick.emit(index);
  }

  buttonApplyFunc(event, index: number) {
    // console.log('event',event)
    // console.log('index',index)
    this.buttonApplyClick.emit({'action': event, 'index': index});
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
