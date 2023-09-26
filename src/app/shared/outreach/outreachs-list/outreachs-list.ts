import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Outreach} from '../../services/outreach-service';

@Component({
  selector: 'outreachs-list',
  templateUrl: 'outreachs-list.html'
})
export class OutreachsListComponent {
  @Input() streamRetrieved: boolean;
  @Input() outreachs: Outreach[] = [];
  @Input() sourceType: number;
  @Input() itemFocus: number;
  @Input() showEditBtn: boolean;
  @Input() planNumber = 2;
  @Input() stream: number[];
  @Input() streamSuggestion: number[];

  @Output() buttonEditClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number[]> = new EventEmitter()

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

  animationDone(): void {
    this.animationDoneEvent.emit(true);
  }

}
