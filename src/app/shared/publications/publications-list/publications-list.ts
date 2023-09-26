import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';

import {ToggleFolder, Publication, SortService} from '../../services/publication-service';

@Component({
  selector: 'publications-list',
  templateUrl: 'publications-list.html',
  styleUrls: ['publications-list.css']
})
export class PublicationsListComponent {
  @Input() smallPicFlag: boolean = false;
  @Input() suggestFlag: boolean = false;
  @Input() rejectFlag: boolean = false;
  @Input() centerFlag: boolean;
  @Input() sourceType: number; // 0 - latest
                               // 1 - search
                               // 2 - suggestions
  @Input() userId: string;
  @Input() showEditBtn: boolean;
  @Input() showHeadline = false;

  @Input() streamRetrieved: boolean;
  @Input() streamSuggestions: number[];
  @Input() stream: number[];
  @Input() streamFolder: number[];

  @Input() publications: Publication[] = [];

  @Output() btnPDF: EventEmitter <{flag: boolean, title: string, fileName: string}> = new EventEmitter(true);
  @Output() btnBuild: EventEmitter <boolean> = new EventEmitter(true);
  @Output() btnFolder: EventEmitter <[string, number, ToggleFolder]> = new EventEmitter();

  // @Output() btnRefresh: EventEmitter <boolean> = new EventEmitter(true);
  @Output() btnAccpet: EventEmitter <[string, number]> = new EventEmitter();
  @Output() btnReject: EventEmitter <[string, number]> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  publicationLen = 0;

  constructor(public sortService: SortService) { }

  pdfSlide(flag: boolean, event) {
    this.btnPDF.emit({flag: flag, title: event.title, fileName: event.fileName});
  }

  publicationSlide() {
    this.btnBuild.emit(true);
  }

  // suggestionRefresh() {
  //   this.btnRefresh.emit(true);
  // }

  publicationDelete() {

  }

  btnFolderFunc(id: string, index: number, toggleFolder: ToggleFolder): void {
    this.btnFolder.emit([id, index, toggleFolder]);
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
