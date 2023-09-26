import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Teaching} from '../../services/teaching-service';

@Component({
  selector: 'teachings-list',
  templateUrl: 'teachings-list.html'
})
export class TeachingsListComponent {
  @Input() streamRetrieved: boolean;
  @Input() teachings: Teaching[] = [];
  @Input() sourceType: number;
  @Input() itemFocus: number;
  @Input() showEditBtn: boolean;
  @Input() planNumber = 2;
  // @Input() bagName: string;
  @Input() stream: number[];
  @Input() streamFollow: number[];
  @Input() streamSuggestion: number[];

  @Output() buttonEditClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <number> = new EventEmitter();
  // @Output() buttonFollowClick: EventEmitter <number> = new EventEmitter();
  // @Output() buttonMoveClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number[]> = new EventEmitter()

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  buttonEditFunc(index: number): void {
    this.buttonEditClick.emit(index);
  }

  buttonDeleteFunc(index: number): void {
    this.buttonDeleteClick.emit(index);
  }

  // buttonFollowFunc(index: number): void {
  //   this.buttonFollowClick.emit(index);
  // }

  // buttonMoveFunc(index: number): void {
  //   this.buttonMoveClick.emit(index);
  // }

  buttonSuggestionFunc(action: number, index: number): void {
    this.buttonSuggestionClick.emit([index, action]);
  }

  animationDone(): void {
    this.animationDoneEvent.emit(true);
  }

}
