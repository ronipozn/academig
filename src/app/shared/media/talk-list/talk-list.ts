import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Talk} from '../../services/media-service';

@Component({
  selector: 'media-talk-list',
  templateUrl: 'talk-list.html'
})
export class MediaTalksListComponent {
  @Input() talks: Talk[];
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

  animationDone(): void {
    this.animationDoneEvent.emit(true);
  }

}
