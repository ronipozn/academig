import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {AuthService} from '../../../auth/auth.service';

import {JournalObj, PublicationDetails, PublicationService} from '../../services/publication-service';
import {PeopleService} from '../../services/people-service';
import {InviteService} from '../../services/invite-service';
import {objectMini, objectMiniType, objectMiniEmail, SharedService} from '../../services/shared-service';

import {UserService} from '../../../user/services/user-service';
import {SettingsService} from '../../../shared/services/settings-service';

import {MetaService} from '../../services/meta-service';

import {NgbPopoverConfig} from '@ng-bootstrap/ng-bootstrap';

import {itemsAnimation} from '../../animations/index';

@Component({
  selector: 'publication-details',
  templateUrl: 'publication-details.html',
  providers: [NgbPopoverConfig],
  styleUrls: ['publication-details.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PublicationDetailsComponent {
  @Input() parentId: string;
  @Input() projId: string;
  @Input() userId: string;
  @Input() sourceType: number; // 0 - group publication
                               // 1 - library publication
                               // 2 - search publication
                               // 3 - project publication
                               // 4 - resource publication
                               // 5 - profile publication
  @Input() showEditBtn: boolean;

  @Output() title: EventEmitter <string> = new EventEmitter(true);

  @ViewChild('scrollAbstract', { static: false }) private scrollAbstract: ElementRef;
  @ViewChild('scrollData', { static: false }) private scrollData: ElementRef;
  @ViewChild('scrollRefs', { static: false }) private scrollRefs: ElementRef;
  @ViewChild('scrollCitations', { static: false }) private scrollCitations: ElementRef;
  @ViewChild('scrollComments', { static: false }) private scrollComments: ElementRef;
  @ViewChild('scrollMissing', { static: false }) private scrollMissing: ElementRef;
  @ViewChild('toggleClaimModal', { static: true }) toggleClaim: ElementRef;

  publication: PublicationDetails;
  toggleAbstractFlag = false;

  typeName: string;
  journal: string; // Paper, Report, Conference(conference)
  // abbr: string; // Paper, Report
  volume: string; // Paper, Chapter(chapter), Patent(patentNumber), Report(reportNumber)
  // issue: string; // Paper
  pages: string; // Paper, Chapter, Conference, Book(length), Patent(applicationNumber)
  // edition: string; // Book, Chapter

  streamRetrieved: boolean;

  miniBuildFlag: boolean[] = [false, false, false];
  fieldBuildFlag: boolean[] = new Array(9).fill(0);

  journalBuildFlag: boolean = false;
  tagsBuildFlag: boolean = false;

  adminFlag: boolean = false;

  figuresAddFlag = false;
  figuresIndex: number;
  figuresNewFlag: boolean;
  figuresData: objectMiniType[] = [];
  figuresCount: number;

  fieldNewFlag: boolean;

  authorFlag: boolean = false;
  missingCoAuthors: objectMiniEmail[];

  inviteFlag: boolean = false;
  inviteIndex: number;

  suggestFlag: boolean = false;
  suggestIndex: number;

  streamFolder: number;
  streamMini: number[] = [0, 0, 0];
  streamField: number[] = new Array(12).fill(0);
  streamFigures: number[] = [];

  abstractMax: number = 600;

  // thumbnail: string;

  constructor(private titleService: Title,
              private sharedService: SharedService,
              private authService: AuthService,
              private peopleService: PeopleService,
              private publicationService: PublicationService,
              private inviteService: InviteService,
              private metaService: MetaService,
              private settingsService: SettingsService,
              public userService: UserService,
              public config: NgbPopoverConfig,
              private _router: Router) {
    config.placement = 'bottom';
    config.triggers = 'hover';
  }

  ngOnInit() {
    this.authService.token.subscribe(token => this.adminFlag = this.authService.userHasScopes(token, ['write:publications']));
  }

  ngOnChanges() {
    this.publication = null;
    this.updatePage()
  }

  tagClickOp(i: number) {
    this.userService.searchText = this.publication.tags[i];
    this._router.navigate(['./search']);
  }

  async updatePage() {
    this.streamRetrieved = false;

    const publication: PublicationDetails = await this.publicationService.getPublicationDetails(this.projId, this.parentId);

    if (publication) {
      this.publication = publication;
      this.titleService.setTitle(publication.title + ' | Academig');
      this.metaService.addMetaTags(publication.abstract ? publication.abstract.slice(0,160) : null, publication.tags ? publication.tags.toString() : null, publication.title);
      this.streamRetrieved = true;

      this.streamFolder = 0;

      if (this.publication.figures) {
        this.figuresCount = this.publication.figures.map(r=>r.type==0).length;
      } else {
        this.figuresCount = 0;
        this.publication.figures = [];
      }

      this.streamFigures = new Array(this.figuresCount).fill(0);

      if (this.publication.authors) {
        // this.authorFlag = this.userId ? (this.publication.authors.findIndex(x => x._id == this.userId)>-1 || this.adminFlag) : false;
        this.authorFlag = (this.userId) ? (this.publication.authors.findIndex(x => x._id == this.userId)>-1) : false;

        const authors: objectMiniEmail[] = this.publication.authors as objectMiniEmail[];

        this.missingCoAuthors = authors.filter(x => x.pic == null);
      }

      // this.thumbnail = this.publication.pdf + '.jpg';
      this.title.emit(this.publication.title);
      switch (this.publication.type) {
         case 0: {
           this.typeName = 'Paper';
           this.journal = 'Journal';
           this.volume = 'Volume';
           this.pages = 'Pages';
           break; }
         case 1: {
           this.typeName = 'Book';
           this.pages = 'Length';
           break; }
         case 2: {
           this.typeName = 'Book Chapter';
           this.volume = 'Chapter';
           this.pages = 'Pages';
           break; }
         case 3: {
           this.typeName = 'Conference';
           this.journal = 'Conference'
           this.volume = 'Volume';
           this.pages = 'Pages';
           break; }
         case 4: {
           this.typeName = 'Patent';
           this.volume = 'Patent number';
           this.pages = 'Application number';
           break;
         }
         case 5: {
           this.typeName = 'Report';
           this.volume = 'Report number';
           this.journal = 'Journal';
           this.volume = 'Report number';
           break;
         }
      }

    } else {

      this.publication = null;
      this.streamRetrieved = true;
      this.title.emit('[Publication not available]');

    }

  }

  // pdfSlide(flag: boolean, title: string, fileName: string) {
  //   this.pdfSlideFlag = flag;
  //   if (flag == true) {
  //     this.pdfTitle = title;
  //     this.pdfFileName = fileName;
  //   }
  // }

  toggleAbstract(): void {
    this.toggleAbstractFlag = !this.toggleAbstractFlag;
  }

  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////

  async miniOp(mode: number, type: number, flag: boolean, event) {
    this.miniBuildFlag[type] = flag;

    let miniMode: number;

    if (this.sourceType == 0) {
      miniMode = 7;
    } else if (this.sourceType == 5) {
      miniMode = 8;
    } else if (this.sourceType == 3) {
      miniMode = 9;
    } else if (this.sourceType == 4) {
      miniMode = 10;
    }

    if (mode == 2) {
      if (type == 0) {
        this.publication.authors = event;
        this.authorFlag = this.userId ? (this.publication.authors.findIndex(x => x._id == this.userId)>-1) : false;
        const authors: objectMiniEmail[] = this.publication.authors as objectMiniEmail[];
        this.missingCoAuthors = authors.filter(x => x._id == null);
      } else if (type == 1) {
        this.publication.fundings = event;
      // } else if (type==2) {
      //   this.publication.projects=event;
      }

      this.streamMini[type] = 3;

      await this.sharedService.updateMinis(miniMode, type, this.projId, this.parentId, event);

      this.streamMini[type] = 1;
    }

  }

  async inviteOp(mode: number, index: number, flag: boolean, event) {
    this.inviteFlag = flag;
    this.inviteIndex = index;

    if (mode == 2) {

      // this.publication.authors[index] = event[0];
      // this.streamMini[type] = 3;
      this.missingCoAuthors[index] = event[0];

      this.missingCoAuthors[index]._id = await this.inviteService.authorInvite(7, this.projId, event[0]);

      if (this.missingCoAuthors[index].dates) {
          this.missingCoAuthors[index].dates.push(new Date());
        } else {
          this.missingCoAuthors[index].dates = [new Date()];
        }
        // this.streamMini[type] = 1;
      }

  }

  async suggestOp(mode: number, index: number, flag: boolean, event) {
    this.suggestFlag = flag;
    this.suggestIndex = index;

    if (mode == 2) await this.inviteService.authorSuggest(this.projId, event[0]);

  }

  // title - 0
  // Date - 1
  // Volume - 2
  // Issue - 3
  // Edition - 4
  // Pages - 5
  // Publisher - 6
  // Abstract - 7
  // DOI - 8
  // PDF - 9

  async fieldOp(mode: number, flag: boolean, type: number, event) {
    this.fieldBuildFlag[type] = flag;

    if (mode == 1) {

      switch (type) {
         case 0: this.publication.title = null; break;
         case 1: this.publication.date = null; break;
         case 2: this.publication.volume = null; break;
         case 3: this.publication.issue = null; break;
         case 4: this.publication.edition = null; break;
         case 5: this.publication.pages = null; break;
         case 6: this.publication.publisher = null; break;
         case 7: this.publication.abstract = null; break;
         case 8: this.publication.doi = null; this.publication.url = null; break;
         case 9: this.publication.pdf = null; break;
      }

      this.streamField[type] = 3;

      await this.publicationService.deletePublicationField(type, this.sourceType, this.projId, this.parentId);

      this.streamField[type] = 1;

    } else if (mode == 2) {
      switch (type) {
         case 0: this.publication.title = event.text; break;
         case 1: this.publication.date = event.text; break;
         case 2: this.publication.volume = event.text; break;
         case 3: this.publication.issue = event.text; break;
         case 4: this.publication.edition = event.text; break;
         case 5: this.publication.pages = event.text; break;
         case 6: this.publication.publisher = event.text; break;
         case 7: this.publication.abstract = event.text; break;
         case 8: {
                  this.publication.doi = event.name;
                  this.publication.url = event.link;
                  break;
                 }
         case 9: this.publication.pdf = event; break;
      }

      this.streamField[type] = 3;

      await this.publicationService.updatePublicationField(type, this.sourceType, this.projId, this.parentId, (type > 7) ? event : event.text);

      this.streamField[type] = 1;
    }

  }

  async abstractOp(mode: number, flag: boolean, event) {
    this.fieldBuildFlag[7] = flag;

    let type: number;

    if (this.sourceType == 0) {
      type = 7;
    } else if (this.sourceType == 5) {
      type = 8;
    } else if (this.sourceType == 3) {
      type = 9;
    } else if (this.sourceType == 4) {
      type = 10;
    } else {
      type = 11; // FIX???
    }

    if (mode == 1) {
      this.streamField[7] = 3;

      await this.sharedService.deleteTextPic(type, this.projId, this.parentId);

      this.publication.abstract = null;
      this.publication.abstractPic = null;
      this.streamField[7] = 0;

    } else if (mode == 2) {
      this.publication.abstract = event.text;
      this.publication.abstractPic = event.pic;

      this.streamField[7] = 3;

      await this.sharedService.postTextPic(type, this.projId, this.parentId, event.text, event.pic, null);

      this.streamField[7] = 1;
    }

  }

  async tagsOp(mode: number, flag: boolean, event) {
    this.tagsBuildFlag = flag;

    if (mode == 1) {

      this.streamField[11] = 3;

      await this.sharedService.deleteTags(6, this.projId, this.parentId);

      this.publication.tags = [];
      this.streamField[11] = 0;

     } else if (mode == 2) {

      this.publication.tags = event;
      this.streamField[11] = 3;

      await this.sharedService.postTags(6, this.publication.tags, this.projId, this.parentId);
      this.streamField[11] = 1;

     } else if (mode == 3) {

      this.streamField[11] = 0;

     }
  }

  async journalOp(mode: number, flag: boolean, event) {
    this.journalBuildFlag = flag;

    if (mode == 1) {

      this.streamField[10] = 3;

      await this.publicationService.deletePublicationJournal(this.sourceType, this.projId, this.parentId);

      this.publication.journal.name = null;
      this.publication.journal.issn = [];
      this.streamField[10] = 0;

    } else if (mode == 2) {

      if (event.journal.name) {
        this.publication.journal.name = event.journal.name;
        this.publication.journal.issn = event.journal.issn;
      } else {
        this.publication.journal.name = event.journal;
        this.publication.journal.issn = [];
      }

      this.publication.issue = event.issue;
      this.publication.pages = event.pages;
      this.publication.publisher = event.publisher;
      this.publication.volume = event.volume;
      // this.publication.edition = event.edition;

      const journalObj: JournalObj  = {
                          journal: event.journal.name ? event.journal : {name: event.journal, issn: []},
                          issue: event.issue,
                          pages: event.pages,
                          publisher: event.publisher,
                          volume: event.volume
                        }

      this.streamField[10] = 3;

      await this.publicationService.updatePublicationJournal(this.sourceType, this.projId, this.parentId, journalObj);

      this.streamField[10] = 1;

    } else if (mode == 3) {

      this.streamField[10] = 0;

    }

  }

  figuresSlide(flag: boolean, i: number, newFlag: boolean) {
    this.figuresAddFlag = flag;
    this.figuresIndex = i;
    this.figuresNewFlag = newFlag;
  }

  async figuresPicsUpdate(data) {
    this.figuresAddFlag = false;

    if (!this.figuresNewFlag) { // edit a single figure

      this.streamFigures[this.figuresIndex] = 3;

      const item: objectMiniType = {
                                    '_id': this.publication.figures[this.figuresIndex]._id,
                                    'name': data.text,
                                    'pic': data.pic,
                                    'type': this.publication.figures[this.figuresIndex].type
                                   };

      this.publication.figures[this.figuresIndex] = item;

      await this.sharedService.postShowcase(6, this.publication._id, this.parentId, item);

      this.streamFigures[this.figuresIndex] = 1;

    } else { // add multiple figure

      // const newFiguresCount = data.figures ? Number(data.figures[data.figures.length - 2]) : 0;
      // const newTablesCount = data.tables ? Number(data.tables[data.tables.length - 2]) : 0;
      // const supplementsCount: number = data.figures[data.figures.length - 2];

      const newFiguresCount = data.figures.substring(data.figures.lastIndexOf("~") + 1,data.figures.lastIndexOf("/"));
      const newTablesCount = data.tables.substring(data.tables.lastIndexOf("~") + 1,data.tables.lastIndexOf("/"));

      const items: objectMiniType[] = [];

      for (let _i = 0; _i < newFiguresCount+newTablesCount; _i++) {
        items[_i] = {
                     '_id': null,
                     'pic': (_i<newFiguresCount) ? (data.figures + 'nth/' + _i + '/') : (data.tables + 'nth/' + (_i-newFiguresCount) + '/'),
                     'name': null,
                     'type': (_i<newFiguresCount) ? 0 : 1
                    };
      }

      for (const item of items) {
        this.publication.figures.push(item);
      }

      const newLen: number = items.length;
      let last: number;

      this.figuresCount = this.publication.figures.map(r=>r.type==0).length;

      await this.sharedService.putShowcaseFigures(6, this.publication._id, this.parentId, items);

      // FIX
      // last = this.gallery.pics.length - 1;
      // for (const _id of data.reverse()) {
      //   this.gallery.pics[last]._id = _id;
      //   last += -1;
      // }

    }
  }

  async figureDelete(i: number) {
    const _id: string = this.publication.figures[i]._id;
    this.streamFigures[i] = 3;

    await this.sharedService.deleteShowcase(6, this.publication._id, this.parentId, _id);

    this.publication.figures.splice(i, 1);
    this.streamFigures[i] = 0;
  }

  async publicationFolder() {
    const itemId: string = this.publication._id;
    // const folders: Folder[] = this.publication.folders;
    this.streamFolder = 3;
    // await this.peopleService.toggleFollow(0, 0, itemId, toFollow);
    this.streamFolder = 0;
    // this.publication.folders = folders;
    // this.userService.toggleFollow(toFollow, itemId, "publication");
  }

  openClaimModalFunc() {
    this.toggleClaim.nativeElement.click();
  }

  closeClaimModalFunc() {
    this.toggleClaim.nativeElement.click();
  }

  animationDone(i: number, j: number): void {
    this.streamField[j] = 0;
  }

  animationDoneMini(i: number, j: number): void {
    this.streamMini[j] = 0;
  }

  scrollNav(type: number) {
    switch (type) {
      case 0: this.scrollAbstract.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
      case 1: this.scrollData.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
      case 2: this.scrollCitations.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
      case 3: this.scrollRefs.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
      case 4: this.scrollComments.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
      case 5: this.scrollMissing.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
    };
  }

  async planUpdate() {
    const mode: number = 0; // User / Lab / Company / Department
    const type: number = 1; // Free / PRO / PRO+
    const period: number = 0; // Monthly / Yearly

    const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, null);

    stripe.redirectToCheckout({sessionId: plan.id}).then(function(result) {});
  }

}
