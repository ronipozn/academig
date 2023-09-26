import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Poster, MediaService} from '../../services/media-service';

@Component({
  selector: 'media-poster-list',
  templateUrl: 'poster-list.html'
})
export class MediaPostersListComponent {
  @Input() posters: Poster[];
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
  @Output() btnPDF: EventEmitter <{title: string, fileName: string}> = new EventEmitter();

  pdfSlide(event) {
    this.btnPDF.emit(event);
  }

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
