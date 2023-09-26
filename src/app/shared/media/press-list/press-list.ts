import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Press} from '../../services/media-service';

@Component({
  selector: 'media-press-list',
  templateUrl: 'press-list.html'
})
export class MediaPressListComponent {
  @Input() presses: Press[];
  @Input() sourceType: number;
  @Input() showEditBtn: number;
  @Input() bagName: string;
  @Input() itemFocus: number;

  @Input() streamRetrieved: boolean;
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

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
