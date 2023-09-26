import {Component, Input, OnInit, OnDestroy, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';

import {ToggleFolder, Publication} from '../../services/publication-service';
import {objectMini} from '../../services/shared-service';
import {UserService} from '../../../user/services/user-service';

@Component({
  selector: '[publication-item-table]',
  templateUrl: 'publication-item-table.html',
  styleUrls: ['publication-item-table.css']
})
export class PublicationItemTableComponent implements OnInit, OnDestroy {
  @Input() publication: Publication;
  @Input() typesFlag: boolean[];
  @Input() sourceType: number; // 0 - group / profile home
                               // 1 - wall
                               // 2 - search
                               // 3 - project
                               // 4 - resource
                               // 5 - library
                               // 6 - papers kit
  @Input() showEditBtn: boolean;
  @Input() index: number;
  @Input() stream: number;
  @Input() streamFolder: string[];
  @Input() userId: string;
  @Input() suggestFlag: boolean = false;

  @Output() pdf: EventEmitter <{title: string, fileName: string}> = new EventEmitter(true);
  @Output() stats: EventEmitter <{nums: number [], id: string}> = new EventEmitter(true);
  @Output() checkboxTouch: EventEmitter <boolean> = new EventEmitter(true);
  @Output() generalTouch: EventEmitter <boolean> = new EventEmitter(true);

  @Output() btnFolder: EventEmitter <ToggleFolder> = new EventEmitter();
  @Output() btnReadAdd: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @Input() set folderToggle(value: boolean) {
    if (this.publication.folders) {
      this.folders = [...new Set(this.publication.folders.map(x => x.folder))];
      if (this.sourceType==5) {
        this.readDates  = this.publication.folders.filter(x => x.folder === 'read').map(x => x.date);
        this.wantDates  = this.publication.folders.filter(x => x.folder === 'want').map(x => x.date);
        this.currentDates  = this.publication.folders.filter(x => x.folder === 'current').map(x => x.date);
      }
    }
  }

  @Input() set generalToggle(value: boolean) {
     this._generalToggle = value;
     this.generalToggleFunc();
  }

  get generalToggle(): boolean {
      return this._generalToggle;
  }

  @ViewChild('specificCheckbox', { static: false }) checkbox;
  @ViewChild('toggleShareModal', { static: true }) toggleShare: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  shareFlag: boolean = false;

  generalName: string;
  generalNumbers: string;

  typeName: string;
  _generalToggle: boolean;

  action: string;

  folders: string[];
  readDates: Date[];
  wantDates: Date[];
  currentDates: Date[];
  createdDate: Date[] = [];

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

  generalToggleFunc() {
    this.generalTouch.emit(this._generalToggle);
  }

  checkboxTouchFunc() {
    this.checkboxTouch.emit(this.checkbox.nativeElement.checked);
  }

  // pdfSlide(title: string, fileName: string) {
  //   this.pdf.emit({title, fileName})
  // }

  ngOnInit() {
    // console.log('this.publication',this.publication)

    // if (this.typesFlag[this.publication.type]==true) {
    this.stats.emit({
                     'nums': [this.publication.citationsCount ? this.publication.citationsCount : 0,     // citations
                              0,                                   // impact factor
                              this.publication.views[4],           // views
                              this.publication.type,               // type
                              Number(this.checkbox ? this.checkbox.nativeElement.checked : false), // checked status
                              1
                             ],
                     'id': this.publication._id,                    // id
                   });

    switch (this.publication.type) {
       case 0: {
         // console.log('this.publication',this.publication)
         this.typeName = 'Paper';
         this.generalName = this.publication.journal ? this.publication.journal.name : null;
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
         this.generalNumbers = this.publication.volume.toString();
         break;
       }
       // default: console.log('Invalid choice', this.publication.type);
    }

    if (this.sourceType==5 && this.publication.folders) {
      this.folders = [...new Set(this.publication.folders.map(x => x.folder))];
      this.readDates  = this.publication.folders.filter(x => x.folder === 'read').map(x => x.date);
      this.wantDates  = this.publication.folders.filter(x => x.folder === 'want').map(x => x.date);
      this.currentDates  = this.publication.folders.filter(x => x.folder === 'current').map(x => x.date);
      this.createdDate  = this.publication.folders.filter(x => x.folder === null).map(x => x.date);
    }
  }

  btnFolderFunc(toggleFolder: ToggleFolder): void {
    if (this.userService.userEmailVerified) {
      this.btnFolder.emit(toggleFolder);
    } else {
      this.action = "reading folder";
      this.toggleSignUp.nativeElement.click();
    }
  }

  btnReadAddFunc(): void {
    if (this.userService.userEmailVerified) {
      this.btnReadAdd.emit(true);
    } else {
      this.action = "reading folder";
      this.toggleSignUp.nativeElement.click();
    }
  }

  animationDone(event): void {
    // this.showButton=false;
    // DISABLE DELETE CHECKBOX
    this.animationDoneEvent.emit(true);
  }

  ngOnDestroy() {
    this.stats.emit({
                     'nums': [-this.publication.citationsCount,            // citations
                              0,                                           // impact factor
                              -this.publication.views[4],                  // views
                              this.publication.type,                       // type
                              Number(this.checkbox ? this.checkbox.nativeElement.checked : false), // checked status
                              -1
                             ],
                     'id': this.publication._id,                           // id
                   });

    // this.stats.emit([-this.publication.citationsCount,
    //                  0,
    //                  -this.publication.views[4],
    //                  this.publication.type,
    //                  this.publication.id,
    //                  Number(this.checkbox.nativeElement.checked), // checked status
    //                  -1
    //                ]);

  }

}
