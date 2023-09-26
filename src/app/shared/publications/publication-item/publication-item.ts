import {Component, Input, OnInit, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';

import {ToggleFolder, Publication} from '../../services/publication-service';
import {UserService} from '../../../user/services/user-service';

@Component({
  selector: 'publication-item',
  templateUrl: 'publication-item.html'
})
export class PublicationItemComponent implements OnInit {
  @Input() publication: Publication;
  @Input() sourceType: number; // 0 - group / profile
                               // 1 - wall
                               // 2 - search
                               // 3 - project
                               // 4 - resource
  @Input() showEditBtn: boolean;

  @Input() stream: number;
  @Input() streamFolder: number;
  @Input() streamSuggestion: number = 0;
  @Input() userId: string;

  @Input() smallPicFlag: boolean = false;
  @Input() suggestFlag: boolean = false;
  @Input() rejectFlag: boolean = false;
  @Input() centerFlag: boolean = false;

  @Output() pdf: EventEmitter <{title: string, fileName: string}> = new EventEmitter(true);

  @Output() btnFolder: EventEmitter <ToggleFolder> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @Output() btnAccept: EventEmitter <boolean> = new EventEmitter();
  @Output() btnReject: EventEmitter <boolean> = new EventEmitter();

  @ViewChild('toggleShareModal', { static: true }) toggleShare: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  shareFlag = false;
  generalName: string;
  generalNumbers: string;
  typeName: string;

  action: string;

  constructor(
    public userService: UserService
  ) { }

  openShareModalFunc() {
    if (this.userService.userEmailVerified) {
      this.toggleShare.nativeElement.click();
      this.shareFlag = true;
    } else {
      this.action = "share";
      this.toggleSignUp.nativeElement.click();
    }
  }

  closeShareModalFunc() {
    this.toggleShare.nativeElement.click();
    this.shareFlag = false;
  }

  pdfSlide(title: string, fileName: string) {
    this.pdf.emit({title, fileName})
  }

  ngOnInit() {
    switch (this.publication.type) {
       case 0: {
         this.typeName = 'Paper';
         this.generalName = this.publication.journal.name;
         this.generalNumbers = this.publication.volume +
                               (this.publication.issue ? '(' + this.publication.issue + ')' : '') +
                               (this.publication.pages && this.publication.issue ? ', ' : '') +
                               this.publication.pages;
         break;
       }
       case 1: {
         this.typeName = 'Book';
         this.generalName = this.publication.edition;
         this.generalNumbers = this.publication.pages;
         break;
       }
       case 2: {
         this.typeName = 'Book Chapter';
         this.generalName = this.publication.edition;
         this.generalNumbers = (this.publication.volume ? this.publication.volume + ' ' : '') + this.publication.pages;
         break;
       }
       case 3: {
         this.typeName = 'Conference';
         this.generalName = this.publication.journal.name;
         this.generalNumbers = this.publication.pages;
         break;
       }
       case 4: {
         this.typeName = 'Patent';
         this.generalName = '';
         this.generalNumbers = (this.publication.volume ? this.publication.volume + ' ' : '') + this.publication.pages;
         break;
       }
       case 5: {
         this.typeName = 'Report';
         this.generalName = this.publication.journal.name;
         this.generalNumbers = this.publication.volume ? this.publication.volume.toString() : '';
         break;
       }
       // default: console.log('Invalid choice', this.publication.type);
    }
  }

  btnFolderFunc(toggleFolder: ToggleFolder): void {
    this.btnFolder.emit(toggleFolder);
  }

  suggestionAcceptFunc(): void {
    this.btnAccept.emit(true);
  }

  suggestionRejectFunc(): void {
    this.btnReject.emit(true);
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
