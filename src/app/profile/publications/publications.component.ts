import {Component, Input, OnDestroy, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, ActivatedRoute} from '@angular/router';
import {FormGroup, FormControl, Validators } from '@angular/forms';

import {Folder, CreatePublication, Publication, PublicationService} from '../../shared/services/publication-service';
import {People, PeopleService} from '../../shared/services/people-service';

import {objectMini, SharedService} from '../../shared/services/shared-service';
import {MissionService} from '../services/mission-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
  selector: 'profile-publications',
  templateUrl: 'publications.html',
  styleUrls: ['publications.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PublicationsComponent {
  projId: string;
  sourceType = 1; // 0 - group, 1 - wall

  streamDelete: boolean;

  streamPublications: number[];
  streamPublicationsFolder: number[];
  streamPublicationsSuggestions: number[];
  streamPublicationsSuggestionsFolder: number[];
  streamPublicationsRejected: number[];
  streamPublicationsRejectedFolder: number[];

  peoplesCoauthors: People[] = [];
  peoplesDummyCoauthors: objectMini[] = [];
  streamPeopleCoauthors: number[] = [];
  streamPeopleDummyCoauthors: number[] = [];
  coauthorsLength: number;
  dummyCoauthorsLength: number;

  streamNames: number = 0;

  namesBuildFlag = false;

  typesData: number[];
  typesDataSum: number;
  typesCount: number;
  typesFlag: boolean[] = [true, true, true, true, true, true];

  publications: Publication[];
  publicationsSuggestions: Publication[];
  publicationsRejected: Publication[];

  publicationBuildFlag: boolean = false;
  publicationBuild: Publication;

  publicationToggle: boolean;

  dois: string[];

  pdfSlideFlag = false;
  pdfTitle: string;
  pdfFileName: string;

  streamRetrieved: boolean[];

  streamSuggestions: number = 0;

  adminFlag: boolean = false;
  statsAllFlag: boolean = false;

  itemFocus: number;

  suggestions: any;

  tags: string[] = [];
  yearUniqs: any;

  primaryNameInitial: string;

  parentGroup: FormGroup;

  @ViewChild('suggestionsSummaryModal', { static: true }) suggestionsSummary: ElementRef;

  constructor(private titleService: Title,
              private publicationService: PublicationService,
              private peopleService: PeopleService,
              private sharedService: SharedService,
              private authService: AuthService,
              public userService: UserService,
              public missionService: MissionService,
              private _router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.projId = this.missionService.peopleId;
    this.streamRetrieved = [false, false, false, false, false];
    this.titleService.setTitle('Publications - ' + this.missionService.peopleName + ' | Academig');

    var primaryNameArray: string[] = this.missionService.peopleName.replace(/\./g,' ').replace(/\_/g,' ').replace(/\-/g,' ').split(' ');
    primaryNameArray[0] = primaryNameArray[0][0];
    this.primaryNameInitial = titleCase(primaryNameArray.join(' '))

    this.updatePublications();
    this.updateCoauthors();

    this.authService.token.subscribe(token => {
       this.adminFlag = this.authService.userHasScopes(token, ['write:publications'])
      if (this.missionService.meFlag || this.adminFlag) {
        this.updateSuggestions();
        this.updateRejected();
      }

      this.parentGroup = new FormGroup({
        names: new FormControl(this.missionService.peopleNames),
      });
    });
  }

  networkFunc(tab: number) {
    this.missionService.activeTab = tab;
  }

  async updatePublications() {
    this.publications = await this.publicationService.getPublications(1, this.projId, 0);

    this.streamRetrieved[0] = true;
    this.publicationToggle = true;

    this.streamPublications = new Array(this.publications.length).fill(0);
    this.streamPublicationsFolder = new Array(this.publications.length).fill(0);

    const yearArrays = this.publications.map(r => (new Date(r.date)).getFullYear());
    const yearFlatten = [].concat(...yearArrays);
    this.yearUniqs = yearFlatten.reduce((acc, val) => {
      acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
      return acc;
    }, {});

    const tagsArrays = this.publications.map(r => r.tags);
    const tagsFlatten = [].concat(...tagsArrays);
    this.tags  = Array.from(new Set(tagsFlatten)).filter(r => r!="");
  }

  async updateSuggestions() {
    this.publicationsSuggestions = await this.publicationService.getPublications(7, this.projId, 0);
    this.streamRetrieved[1] = true;
    this.streamPublicationsSuggestions = new Array(this.publicationsSuggestions.length).fill(0);
    this.streamPublicationsSuggestionsFolder = new Array(this.publicationsSuggestions.length).fill(0);
  }

  async updateRejected() {
    this.publicationsRejected = await this.publicationService.getPublications(17, this.projId, 0);
    this.streamRetrieved[2] = true;
    this.streamPublicationsRejected = new Array(this.publicationsRejected.length).fill(0);
    this.streamPublicationsRejectedFolder = new Array(this.publicationsRejected.length).fill(0);
  }

  async updateCoauthors() {
    this.peoplesCoauthors = await this.peopleService.getPeoples(9, this.projId, null, 1, 0);
    this.streamRetrieved[3] = true;
    this.coauthorsLength=this.peoplesCoauthors.length;
    this.streamPeopleCoauthors = new Array(this.peoplesCoauthors.length).fill(0);

    this.peoplesDummyCoauthors = await this.sharedService.getCoAuthors(1, this.projId);
    this.streamRetrieved[4] = true;
    this.dummyCoauthorsLength=this.peoplesDummyCoauthors.length;
    this.missionService.dummyCoauthorsLength = this.dummyCoauthorsLength;
    this.streamPeopleDummyCoauthors = new Array(this.peoplesDummyCoauthors.length).fill(0);
  }

  async generateSuggestions() {
    this.streamSuggestions = 3;
    this.suggestions = await this.publicationService.generateSuggestions(this.projId, 1);
    this.streamSuggestions = 1;
    this.updateSuggestions()
  }

  toggleSuggestionModal() {
    this.streamSuggestions = 0;
    this.suggestionsSummary.nativeElement.click();
  }

  publicationSlide(mode: number, flag: boolean) {
    this.publicationBuildFlag = flag;
    this.dois = this.publications.map(r => r.doi);

    // 0: Cancel
    if (mode==1) { // View publication
      this._router.navigate([this.publications[this.publications.length-1]._id], { relativeTo: this.route });
    }
  }

  typesFlagFunc(event) {
    this.typesFlag = event;
  }

  typesDataFunc(x: number[]): void {
    this.typesData = x;
    this.typesCount = this.typesData.filter(x => x>0).length;
  }

  pdfSlide(event) {
    this.pdfSlideFlag = event.flag;

    if (event.flag == true) {
      this.pdfTitle = event.title;
      this.pdfFileName = event.fileName;
    }
  }

  async publicationUpdate(event) {
    const createPublication: CreatePublication = {'type': event.type,
                                                  'title': event.title,
                                                  'parentId': null, //this.projId,
                                                  'folders': null,
                                                  'date': event.date,
                                                  'authors': event.authors,
                                                  'publisher': event.publisher,
                                                  'abstract': event.abstract,
                                                  'abstractPic': event.abstractPic,
                                                  'url': event.url,
                                                  'tags': event.tags,
                                                  'doi': event.doi,
                                                  "projects": event.projects,
                                                  'fundings': event.fundings,

                                                  'pdf': event.pdf,
                                                  'pdfMode': event.pdfMode,

                                                  'journal': event.journal,
                                                  'abbr': event.abbr,
                                                  'volume': event.volume,
                                                  'issue': event.issue,
                                                  'pages': event.pages,
                                                  'edition': event.edition,

                                                  'referencesCount': event.referencesCount,
                                                  'citationsCount': event.citationsCount,

                                                  'ai': null
                                                 };

    const publication: Publication = {'_id': null,
                                      'type': event.type,
                                      'title': event.title,
                                      'views': [0, 0, 0, 0, 0],
                                      'folders': [],
                                      'userFolders': [],
                                      'citations': null,
                                      'date': event.date,
                                      'authors': event.authors,
                                      'abstract': event.abstract,
                                      'abstractPic': event.abstractPic,
                                      'pdf': null,
                                      'citationsCount': event.citationsCount,
                                      'doi': event.doi,
                                      'tags': event.tags,

                                      'journal': event.journal,
                                      'volume': event.volume,
                                      'issue': event.issue,
                                      'edition': event.edition,
                                      'pages': event.pages
                                     };

    this.publications.push(publication);
    this.publicationToggle = !this.publicationToggle;

    const loc = this.publications.length - 1;

    this.streamPublications[loc] = 3;
    this.streamPublicationsFolder[loc] = 0;
    this.itemFocus = loc;

    this.publications[loc]._id = await this.publicationService.putPublication(createPublication, 3);

    this.streamPublications[loc] = 1;

    var suggestionIndex: number = this.publicationsSuggestions.findIndex(x => x.doi == publication.doi);
    if (suggestionIndex>-1) this.publicationsSuggestions.splice(suggestionIndex, 1);

    var flatten = this.tags.concat(event.tags);
    this.tags  = Array.from(new Set(flatten));

    this.userService.userProgress[6] = true;

  }

  async publicationDelete(checkId: string[]) {
    let indexes: number[] = [];

    this.itemFocus = null;

    for (const id of checkId) {
      indexes.push(this.publications.findIndex(x => x._id == id));
    }

    // Sort Descending
    indexes = indexes.sort((a, b) => Number(b) - Number(a));

    this.streamDelete = true;

    await this.publicationService.deletePublications(checkId, this.projId, 3);

    for (const i of indexes) {
      this.publications.splice(i, 1);
      this.streamDelete = false;
      // this.streamPublications[i]=0;
    }
    this.publicationToggle = !this.publicationToggle;

    var arrays = this.publications.map(r => r.tags);
    var flatten = [].concat(...arrays);
    this.tags  = Array.from(new Set(flatten));

    if (this.publications.length==0) this.userService.userProgress[6] = false;

    // indexes.forEach((index) => {this.streamPublications[index] = 2});
  }

  async publicationFolder(event) {
    const folder: Folder = {
      _id: null,
      folder: event[2].folder,
      count: null,
      date: event[2].date,
      end: event[2].end,
      summary: event[2].summary,
      privacy: event[2].privacy,
      rating: event[2].rating,
      recommend: event[2].recommend,
      recommended: event[2].recommended,
      feed: event[2].feed
    }
    const i: number = this.publications.findIndex(x => x._id == event[0]);

    if (this.userService.userId) {
      this.streamPublicationsFolder[event[1]] = 3;
      await this.peopleService.toggleFolder(event[0], folder, event[2].checked);
      const stickFlag: boolean = folder.folder=="want" || folder.folder=="read" || folder.folder=="current";
      if (!stickFlag && event[2].checked) this.userService.toggleFolder(folder.folder);
      if (this.publications[i].folders) {
        if (folder.folder=="want" || folder.folder=="current") this.publications[i].folders = this.publications[i].folders.filter(r => (r.folder!="want" && r.folder!="current"));
        this.publications[i].folders.push(folder);
      } else {
        this.publications[i].folders=[folder];
      }
      this.streamPublicationsFolder[event[1]] = 0;
    } else {
      // this.action = "reading library";
      // this.toggleSignUp.nativeElement.click();
    }
  }

  async suggestionDecision(event, action: number) {
    // streamPublicationsFolder array is not Sorted
    // publications array is sorted

    // event[0] - itemId
    // event[1] - item location "on the screen"

    const i: number = this.publicationsSuggestions.findIndex(x => x._id == event[0]);

    this.streamPublicationsSuggestions[event[1]] = 3;

    this.suggestions = await this.publicationService.decisionSuggestion(this.projId, event[0], action, 1);

    if (action==0) {
      this.publications.push(this.publicationsSuggestions[i]);
      this.publicationToggle = !this.publicationToggle;
    } else if (action==1) {
      var x = this.publicationsSuggestions[i].authors.findIndex(a => a._id==this.projId);
      if (x>-1) {
        this.publicationsSuggestions[i].authors[x]._id = null;
        this.publicationsSuggestions[i].authors[x].pic = null;
      }
      this.publicationsRejected.push(this.publicationsSuggestions[i]);
    }

    this.publicationsSuggestions.splice(i, 1);
    this.streamPublicationsSuggestions[event[1]] = 0;
  }

  streamPublicationsFunc(type: number) {
    this.streamPublications[this.itemFocus] = 0;
  }

  async namesOp(mode: number, flag: boolean, event) {
    this.namesBuildFlag = flag;

    if (mode == 1 && this.streamNames==0) {
      this.streamNames = 3;
      await this.sharedService.deleteTags(9, this.projId, this.projId);
      this.missionService.peopleNames = [];
      this.streamNames = 0;

    } else if (mode == 2) { // && this.streamNames==0
      this.missionService.peopleNames = this.parentGroup.controls['names'].value
      this.streamNames = 3;
      await this.sharedService.postTags(9, this.missionService.peopleNames, this.projId, this.projId);
      this.streamNames = 0;

    } else if (mode == 3) {
      this.streamNames = 0;

    }
  }

}

function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length,
       // as your for does that for you. Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
   return splitStr.join(' ');
}
