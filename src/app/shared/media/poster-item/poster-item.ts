import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {Poster, MediaService} from '../../services/media-service';

@Component({
  selector: 'media-poster-item',
  templateUrl: 'poster-item.html',
  styleUrls: ['poster-item.css']
})
export class MediaPostersItemComponent {
  @Input() poster: Poster;
  @Input() sourceType: number; // 0 - group
                               // 1 - profile
                               // 2 - resource
                               // 3 - department
                               // 4 - university
                               // 5 - group AI
  @Input() showEditBtn: number;
  @Input() stream: number;

  @Input() streamSuggestion: number = 0;

  @Output() btnPDF: EventEmitter <{title: string, fileName: string}> = new EventEmitter();

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();

  @Output() buttonAcceptClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonRejectClick: EventEmitter <boolean> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  // dragFlag = false;
  // this.dragFlag = this.sourceType == 0 && showStatus && this.stream == 0;

  // pdfSlideFlag: boolean = false;
  // posterTitle: string;
  // posterFileName: string;

  pdfSlide(title: string, fileName: string) {
    this.btnPDF.emit({title: title, fileName: fileName});
  }

  buttonEditFunc(event): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(event): void {
    this.buttonDeleteClick.emit(true);
  }

  buttonAccpetFunc() {
    this.buttonAcceptClick.emit(true);
  }

  buttonRejectFunc() {
    this.buttonRejectClick.emit(true);
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
