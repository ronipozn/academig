import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';

import {Publication} from '../../services/publication-service';

@Component({
  selector: 'publications-list-suggest',
  templateUrl: 'publications-list-suggest.html',
  styleUrls: ['publications-list-suggest.css']
})
export class PublicationsListSuggestComponent {
  @Input() sourceType: number; // 0 - latest
                               // 1 - search
                               // 2 - suggestions
  @Input() userId: string;
  @Input() showEditBtn: boolean;
  @Input() showHeadline: boolean = false;
  @Input() suggestFlag: boolean = false;

  @Input() streamRetrieved: boolean;
  @Input() streamSuggestions: boolean;

  @Input() stream: number[];
  @Input() streamFolder: number[];

  @Input() publications: Publication[] = [];

  @Output() btnPDF: EventEmitter <{flag: boolean, title: string, fileName: string}> = new EventEmitter(true);
  @Output() btnBuild: EventEmitter <boolean> = new EventEmitter(true);

  @Output() btnFolder: EventEmitter <[string, number]> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @Output() btnRefresh: EventEmitter <boolean> = new EventEmitter(true);
  @Output() btnAccpet: EventEmitter <[string, number]> = new EventEmitter();
  @Output() btnReject: EventEmitter <[string, number]> = new EventEmitter();

  publicationLen = 0;

  publicationsOriginal: Publication[] = [];

  constructor() { }

  pdfSlide(flag: boolean, event) {
    this.btnPDF.emit({flag: flag, title: event.title, fileName: event.fileName});
  }

  publicationSlide() {
    this.btnBuild.emit(true);
  }

  suggestionRefresh() {
    this.btnRefresh.emit(true);
  }

  publicationDelete() {

  }

  btnFolderFunc(id: string, index: number): void {
    this.btnFolder.emit([id, index]);
  }

  btnAccpetFunc(id: string, index: number): void {
    this.btnAccpet.emit([id, index]);
  }

  btnRejectFunc(id: string, index: number): void {
    this.btnReject.emit([id, index]);
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
