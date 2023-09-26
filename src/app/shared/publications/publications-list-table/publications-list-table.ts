import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';

import {ToggleFolder, Publication, SortService} from '../../services/publication-service';

declare const $: any;

@Component({
  selector: 'publications-list-table',
  templateUrl: 'publications-list-table.html',
  styleUrls: ['publications-list-table.css']
})
export class PublicationsListTableComponent implements OnInit {
  @Input() typesFlag: boolean[];
  @Input() sourceType: number; // 0 - group / profile
                               // 1 - wall
                               // 2 - search
                               // 3 - project
                               // 4 - resource
                               // 5 - library
                               // 6 - papers kit
  @Input() userId: string;
  @Input() showEditBtn: boolean;
  @Input() showHeadline = false;
  @Input() streamRetrieved: boolean;
  @Input() stream: number[];
  @Input() streamFolder: number[];
  @Input() streamDelete: number;
  @Input() publications: Publication[] = [];

  @Input() set foldersToggle(value: boolean) {
    if (this.publications) {
      this.publicationsOriginal = this.publications.slice(0);
      this.folderToggle = !this.folderToggle;
    }
  }

  @Input() set publicationToggle(value: boolean) {
    if (this.publications) {
      this.onSortFunc(this.tableSortBy);
    }
  }

  @Output() stats: EventEmitter <number []> = new EventEmitter(true);
  @Output() types: EventEmitter <number []> = new EventEmitter(true);

  @Output() btnPDF: EventEmitter <{flag: boolean, title: string, fileName: string}> = new EventEmitter(true);
  @Output() btnDelete: EventEmitter <string[]> = new EventEmitter();

  @Output() btnFolder: EventEmitter <[string, number, ToggleFolder]> = new EventEmitter();
  @Output() btnReadAdd: EventEmitter <string> = new EventEmitter();
  @Output() btnReadEdit: EventEmitter <[string, number]> = new EventEmitter();
  @Output() btnReadRemove: EventEmitter <[string, number]> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  calcStats: number[] = [0, 0, 0, 0, 0];
  typeStats: number[] = [0, 0, 0, 0, 0, 0]

  @ViewChild('generalCheckbox', { static: false }) checkbox;

  publicationsOriginal: Publication[] = [];

  // _streamRetrieved = false;
  generalToggle = false;
  checkId: string[] = [];
  currentYear: number;
  tableYearsFilter: number[];
  publicationLen = 0;

  initFlag = false; // For initalizing buttons numbers
  modifyListCount = 0; // For Delete or Add of new items

  pdfSlideFlag = false;
  pdfTitle: string;
  pdfFileName: string;

  tableTitleTabs: string[] = ['Title', 'First Author', 'Last Author', 'Journal'];
  tableTitleSlected = 0;
  tableTitleOrder = 0;

  // tableIndexTabs: string[] = ['Citations','h-index','Impact Factor'];
  tableIndexTabs: string[] = ['Citations'];
  tableIndexSlected = 0;
  tableIndexOrder = 1;

  tableYearsTabs: string[];
  tableYearsSlected = 0;
  tableYearsOrder = 1;

  tableReadTabs: string[] = ['Date Read'];
  tableReadSlected = 0;
  tableReadOrder = 1;

  tableAddedTabs: string[] = ['Date Added'];
  tableAddedSlected = 0;
  tableAddedOrder = 1;

  tableSort: string[] = [];
  tableSortBy;
  tableSortCategory;
  tableSortOrder: string[] = [];

  folderToggle: boolean = false;

  constructor(public sortService: SortService) { // using Service and not a Pipe due to angular
                                                 // global Perforamnce and Minification issues
    const d = new Date();
    this.currentYear = d.getFullYear();
    this.tableYearsTabs = ['All Years',
                           'Since ' + (this.currentYear),
                           'Since ' + (this.currentYear - 1),
                           'Since ' + (this.currentYear - 5)];
    this.tableYearsFilter = [0, this.currentYear, this.currentYear - 1, this.currentYear - 5, 2000, this.currentYear]
  }

  ngOnInit() {
    this.tableSortOrder = (this.sourceType==5) ?
      ['check', 'fw', 'fw', 'check', 'fw', 'check', 'fw', 'check', 'fw', 'check'] :
      ['check', 'fw', 'fw', 'check', 'fw', 'check'];

    this.tableSort.fill('fw', 0, (this.sourceType==5) ? 19 : 11)
    this.tableSortCategory = (this.sourceType==5) ? 5 : 2;
    this.tableSortBy = (this.sourceType==5) ? 16 : 7;
    this.tableSort[this.tableSortBy]='check'
  }

  onSortOrderFunc(i: number) {
    if (i < 2) {
      this.tableSortOrder[0] = 'fw';
      this.tableSortOrder[1] = 'fw';
      this.tableTitleOrder = i;
    } else if (i < 4) {
      this.tableSortOrder[2] = 'fw';
      this.tableSortOrder[3] = 'fw';
      this.tableIndexOrder = i - 2;
    } else if (i < 6) {
      this.tableSortOrder[4] = 'fw';
      this.tableSortOrder[5] = 'fw';
      this.tableYearsOrder = i - 4;
    } else if (i < 8) {
      this.tableSortOrder[6] = 'fw';
      this.tableSortOrder[7] = 'fw';
      this.tableReadOrder = i - 6;
    } else if (i < 10) {
      this.tableSortOrder[8] = 'fw';
      this.tableSortOrder[9] = 'fw';
      this.tableAddedOrder = i - 8;
    }

    this.tableSortOrder[i] = 'check';

    // this.tableSortOrderFlag = i ? true : false;

    this.onSortFunc(null, true)
  }

  onSortFunc(i: number, orderToggle: boolean = false) {
    this.publicationsOriginal = this.publications.slice(0); // avoid mutating, duplicate array instead

    if (!orderToggle) {
      this.tableSort.fill('fw', 0, (this.sourceType==5) ? 19 : 11)
      this.tableSort[i] = 'check';
      this.tableSortBy = i;

      if (i < 4) {
        this.tableTitleSlected = i;
        this.tableSortCategory = 0;
      } else if (i < 7) {
        this.tableIndexSlected = i - 4;
        this.tableSortCategory = 1;
      } else if (i < 11) {
        this.tableYearsSlected = i - 7;
        this.tableSortCategory = 2;
      } else if (i > 11 && i < 15) {
        this.tableReadSlected = i - 11;
        this.tableSortCategory = 4;
      } else if (i < 19) {
        this.tableAddedSlected = i - 15;
        this.tableSortCategory = 5;
      }
    }

    const yearFrom = this.tableYearsFilter[this.tableYearsSlected];
    const yearTo = this.tableYearsFilter[5];

    /////////////
    // Sorting //
    /////////////

    const sortBy: number = this.tableSortBy || ((this.sourceType==5) ? 16 : 7)

    switch (sortBy) {
       case 0: { // Title
         this.sortService.arraySort(this.publicationsOriginal, 'title', this.tableTitleOrder);
         break;
       }
       case 1: { // First Author
         this.sortService.authorSort(this.publicationsOriginal, true, this.tableTitleOrder)
         break;
       }
       case 2: { // Last Author
         this.sortService.authorSort(this.publicationsOriginal, false, this.tableTitleOrder)
         break;
       }
       case 3: { // Journal
         this.sortService.arraySort(this.publicationsOriginal, 'generalName', this.tableTitleOrder);
         break;
       }
       case 4: { // Citations
         this.sortService.arraySort(this.publicationsOriginal, 'citationsCount', this.tableIndexOrder);
         break;
       }
       // case 5: { // h-Index
       //   this.sortService.arraySort(this.publicationsOriginal, 'hIndex', this.tableIndexOrder);
       //   break;
       // }
       // case 6: { // Impact Factor
       //   this.sortService.arraySort(this.publicationsOriginal, 'impact', this.tableIndexOrder);
       //   break;
       // }
       case 7: case 8: case 9: case 10: { // Since Years
         this.sortService.arraySort(this.publicationsOriginal, 'date', this.tableYearsOrder);
         break;
       }
       case 11 : { // Range Years
         this.sortService.arraySort(this.publicationsOriginal, 'date', this.tableYearsOrder);
         this.tableYearsTabs[4] = yearFrom + ' - ' + yearTo;
       }
       case 12: case 13: { // Date read
         this.sortService.folderSort(this.publicationsOriginal, 'read', this.tableReadOrder);
         break;
       }
       case 16: case 17: { // Date added
         this.sortService.folderSort(this.publicationsOriginal, null, this.tableAddedOrder);
         break;
       }
       // default: console.log('Invalid sort choice');
    }

    ///////////////
    // Filtering //
    ///////////////

    if (this.tableYearsSlected == 4) {
      this.publicationsOriginal = this.sortService.yearsRangeFilter(
        this.publicationsOriginal,
        yearFrom,
        yearTo
      );
    } else {
      this.publicationsOriginal = this.sortService.yearsFilter(
        this.publicationsOriginal,
        yearFrom
      );
    }

    // console.log('this.publicationLen',this.publicationLen,this.publications.length)

    if (this.publicationLen < this.publications.length && this.initFlag) { // Add new publication condition
      const pushedId: string = this.publications[this.publications.length - 1]._id;
      const sortedLocation: number = this.publicationsOriginal.findIndex(x => x._id == pushedId);
      this.publicationLen = this.publications.length;
      this.modifyListCount = 1;
    }
  }

  calcStatsFunc(stats: {'nums': number[], 'id': string}): void {

    // stats.nums[0] - citations
    // stats.nums[1] - impact factors
    // stats.nums[2] - views
    // stats.nums[3] - type
    // stats.nums[4] - checkbox status
    // stats.nums[5] - add +1 / -1 for add / remove publication

    // stats.id - publicaiotn id

    // console.log('aaa',this.initFlag,this.modifyListCount)
    this.calcStats[0] += stats.nums[5]; // items counter
    this.calcStats[1] += stats.nums[0]; // citations
    this.calcStats[2] += stats.nums[1]; // impact factors
    this.calcStats[3] += stats.nums[2]; // views

    if (!this.initFlag) {
      this.typeStats[stats.nums[3]] += stats.nums[5];
    }

    if (this.modifyListCount) {
      this.typeStats[stats.nums[3]] += stats.nums[5];
      this.modifyListCount--;
    }

    if (this.publications.length == this.calcStats[0]) {
      this.initFlag = true;
      this.publicationLen = this.publications.length;
    }

    if (stats.nums[4]) {
      // checkId is not an Array ???
      this.checkId = this.checkId.filter(z => z != stats.id);
    }

    if (this.initFlag) {
      this.stats.emit([this.calcStats[0], this.calcStats[1], this.calcStats[2], this.calcStats[3]]);
      this.types.emit(this.typeStats);
    }
  }

  pdfSlide(flag: boolean, event) {
    this.btnPDF.emit({flag: flag, title: event.title, fileName: event.fileName});
  }

  publicationDelete() {
    // console.log('this.checkId',this.checkId)
    this.modifyListCount = this.checkId.length;
    this.btnDelete.emit(this.checkId);
    this.checkId = [];
  }

  checkboxTouch(state: boolean, id: string, specific: boolean) {
    if (this.generalToggle && specific) {
      this.checkbox.nativeElement.indeterminate = true;
    }

    if (state) {
      this.checkId.push(id);
    } else {
      this.checkId = this.checkId.filter(x => x != id);
    }

    // console.log('bbb',state,this.checkId)
    // this.checkStatus[i]=state;
    // this.disableStatus+= state ? 1 : -1;
  }

  btnFolderFunc(id: string, index: number, toggleFolder: ToggleFolder): void {
    this.btnFolder.emit([id, index, toggleFolder]);
  }

  btnReadAddFunc(publicationId: string): void {
    this.btnReadAdd.emit(publicationId);
  }

  btnReadEditFunc(publicationId: string, folderIndex: number): void {
    this.btnReadEdit.emit([publicationId, folderIndex]);
  }

  btnReadRemoveFunc(publicationId: string, folderIndex: number): void {
    this.btnReadRemove.emit([publicationId, folderIndex]);
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

  isMobileMenu() {
    if ($(window).width() > 575) {
      return false;
    }
    return true;
  }

}
