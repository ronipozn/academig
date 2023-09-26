import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, ActivatedRoute} from '@angular/router';
import {FormGroup, FormControl, Validators } from '@angular/forms';

import {MissionService} from '../../services/mission-service';
import {GroupService} from '../../../shared/services/group-service';
import {People, PeopleService} from '../../../shared/services/people-service';
import {UserService} from '../../../user/services/user-service';
import {CreatePublication, Publication, SortService, PublicationService} from '../../../shared/services/publication-service';

import {objectMini, SharedService} from '../../../shared/services/shared-service';
import {AuthService} from '../../../auth/auth.service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-publications',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupPublicationsComponent implements OnInit {
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

  statsData: number[];
  typesData: number[];
  typesDataSum: number;
  typesCount: number;
  typesFlag: boolean[] = [true, true, true, true, true, true];
  // updateTypes: boolean = true;

  publications: Publication[];
  publicationsSuggestions: Publication[];
  publicationsRejected: Publication[];

  streamPublications: number[];
  streamDelete: boolean;
  streamPublicationsFolder: number[];

  pdfSlideFlag: boolean = false;
  pdfTitle: string;
  pdfFileName: string;

  publicationBuildFlag: boolean = false;
  publicationBuild: Publication;

  publicationToggle: boolean;

  dois: string[];

  streamRetrieved: boolean[] = [];
  streamSuggestions: number = 0;

  itemFocus: number;

  suggestions: any;

  tags: string[] = [];
  yearUniqs: any;

  streamNames: number = 0;

  namesBuildFlag: boolean = false;

  adminFlag: boolean = false;
  statsAllFlag: boolean = false;

  primaryNameInitial: string;

  fragment: string;

  parentGroup: FormGroup;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  @ViewChild('suggestionsSummaryModal', { static: true }) suggestionsSummary: ElementRef;

  constructor(private _router: Router,
              private route: ActivatedRoute,
              public titleService: Title,
              public groupService: GroupService,
              public peopleService: PeopleService,
              public userService: UserService,
              public publicationService: PublicationService,
              public sharedService: SharedService,
              public authService: AuthService,
              public missionService: MissionService,
              private sortService: SortService) {}

  ngOnInit() {
    if (this.missionService.groupId) {
      this.titleService.setTitle('Publications - ' + this.missionService.groupTitle + ' | Academig');
      this.streamRetrieved = [false, false, false, false, false];
      this.updatePage();
      this.updateCoauthors();

      this.route.fragment.subscribe(fragment => {
        this.fragment = fragment
        this.scrollFunc()
      });
    }

    this.authService.token.subscribe(token => {
      this.adminFlag = this.missionService.showEditBtn && this.authService.userHasScopes(token, ['write:publications']);
      if (this.missionService.userStatus>=6 || this.adminFlag) {
        this.updateSuggestions();
        this.updateRejected();

        this.parentGroup = new FormGroup({
          names: new FormControl(this.missionService.piNames),
        });
      }
    });
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "add": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  networkFunc() {
    this.missionService.activeTab = 2;
  }

  async updatePage() {
    // this.subscription = this.publicationService.queryPublicationsAuthor("Roni Pozner").subscribe(
    if (this.missionService.piName) {
      var primaryNameArray: string[] = this.missionService.piName.replace(/\./g,' ').replace(/\_/g,' ').replace(/\-/g,' ').split(' ');
      primaryNameArray[0] = primaryNameArray[0][0];
      this.primaryNameInitial = titleCase(primaryNameArray.join(' '))
    }

    this.publications = await this.publicationService.getPublications(2, this.missionService.groupId, 0);

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

  async updateSuggestions(flag: boolean = false) {
    this.publicationsSuggestions = await this.publicationService.getPublications(6, this.missionService.groupId, 0);
    this.sortService.arraySort(this.publicationsSuggestions, 'date', 1);
    this.streamPublicationsSuggestions = new Array(this.publicationsSuggestions.length).fill(0);
    this.streamPublicationsSuggestionsFolder = new Array(this.publicationsSuggestions.length).fill(0);
    this.streamRetrieved[1] = true;
  }

  async updateRejected() {
    this.publicationsRejected = await this.publicationService.getPublications(16, this.missionService.groupId, 0);
    this.streamPublicationsRejected = new Array(this.publicationsRejected.length).fill(0);
    this.streamPublicationsRejectedFolder = new Array(this.publicationsRejected.length).fill(0);
    this.streamRetrieved[2] = true;
  }

  async updateCoauthors() {
    this.peoplesCoauthors = await this.peopleService.getPeoples(9, this.missionService.groupId, null, 4, 0);
    this.streamRetrieved[3] = true;
    this.coauthorsLength=this.peoplesCoauthors.length;
    this.streamPeopleCoauthors = new Array(this.peoplesCoauthors.length).fill(0);

    this.peoplesDummyCoauthors = await this.sharedService.getCoAuthors(0, this.missionService.groupId);
    this.streamRetrieved[4] = true;
    this.dummyCoauthorsLength=this.peoplesDummyCoauthors.length;
    this.streamPeopleDummyCoauthors = new Array(this.peoplesDummyCoauthors.length).fill(0);
  }

  async generateSuggestions() {
    this.streamSuggestions = 3;
    this.suggestions = await this.publicationService.generateSuggestions(this.missionService.groupId, 0);
    this.streamSuggestions = 1;
    this.updateSuggestions(true);
  }

  toggleSuggestionModal() {
    this.streamSuggestions = 0;
    this.suggestionsSummary.nativeElement.click();
  }

  statsDataFunc(x: number[]): void {
    this.statsData = x;
  }

  typesFlagFunc(event) {
    this.typesFlag = event;
  }

  typesDataFunc(c: number[]): void {
    // if (this.updateTypes==true) {
    // this.updateTypes=false;
    // } else {
    // this.typesData=this.typesData;
    // }

    this.typesData = c;
    this.typesDataSum = c.reduce((x, y) => x + y);
    this.typesCount = this.typesFlag.map(x => Number(x)).map(function(e,i){return (e * c[i])}).filter(x => x>0).length;
  }

  pdfSlide(event) {
    this.pdfSlideFlag = event.flag;

    if (event.flag == true) {
      this.pdfTitle = event.title;
      this.pdfFileName = event.fileName;
    }
  }

  publicationSlide(mode: number, flag: boolean) {
    this.publicationBuildFlag = flag;
    this.dois = this.publications.map(r => r.doi);

    // 0: Cancel
    if (mode==1) { // View publication
      this._router.navigate([this.publications[this.publications.length-1]._id], { relativeTo: this.route });
    }
  }

  async publicationUpdate(event) {
    const createPublication: CreatePublication = {'type': event.type,
                                                  'title': event.title,
                                                  'parentId': this.missionService.groupId,
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

                                                  'ai': event.intelligence ? event.intelligence[0] : null
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

    this.publications[loc]._id = await this.publicationService.putPublication(createPublication, 0);

    this.streamPublications[loc] = 1;
    this.missionService.groupProgress[5] = 1;

    var suggestionIndex: number = this.publicationsSuggestions.findIndex(x => x.doi == publication.doi);
    if (suggestionIndex>-1) this.publicationsSuggestions.splice(suggestionIndex, 1);

    var flatten = this.tags.concat(event.tags);
    this.tags  = Array.from(new Set(flatten));
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
    // indexes.forEach((index) => {this.streamPublications[index]=3});

    await this.publicationService.deletePublications(checkId, this.missionService.groupId, 0);

    for (const i of indexes) {
      this.publications.splice(i, 1);
      this.streamDelete = false;
    }

    if (this.publications.length == 0) this.missionService.groupProgress[5] = 0;

    this.publicationToggle = !this.publicationToggle;

    var arrays = this.publications.map(r => r.tags);
    var flatten = [].concat(...arrays);
    this.tags  = Array.from(new Set(flatten));

    // indexes.forEach((index) => {this.streamPublications[index] = 2});
  }

  async publicationFolder(event) {
    // streamPublicationsFolder array is not Sorted
    // publications array is sorted

    // event[0] - itemId
    // event[1] - item location "on the screen"

    // const i: number = this.publications.findIndex(x => x._id == event[0]);
    // const library: string[] = this.publications[i].folders;

    this.streamPublicationsFolder[event[1]] = 3;
    // await this.peopleService.toggleFollow(0, 0, event[0], toRead);
    // this.publications[i].folders = library;
    this.streamPublicationsFolder[event[1]] = 0;
    // this.userService.toggleFollow(toRead, event[0], "publication");
  }

  async suggestionDecision(event, action: number) {
    // streamPublicationsFolder array is not Sorted
    // publications array is sorted

    // event[0] - itemId
    // event[1] - item location "on the screen"

    const i: number = this.publicationsSuggestions.findIndex(x => x._id == event[0]);

    this.streamPublicationsSuggestions[event[1]] = 3;

    await this.publicationService.decisionSuggestion(this.missionService.groupId, event[0], action, 0);

    if (action==0) {
      this.publications.push(this.publicationsSuggestions[i]);
      this.publicationToggle = !this.publicationToggle;

      var flatten = this.tags.concat(this.publicationsSuggestions[i].tags);
      this.tags  = Array.from(new Set(flatten));
    } else if (action==1) {
      this.publicationsRejected.push(this.publicationsSuggestions[i]);
    }

    this.publicationsSuggestions.splice(i, 1);
    this.streamPublicationsSuggestions[event[1]] = 0;
  }

  streamFunc(type: number) {
    this.streamPublications[this.itemFocus] = 0;
  }

  async namesOp(mode: number, flag: boolean, event) {
    this.namesBuildFlag = flag;

    if (mode==1 && this.streamNames==0) {
      this.streamNames = 3;
      await this.sharedService.deleteTags(8, this.missionService.groupId, this.missionService.groupId);
      this.missionService.piNames = [];
      this.streamNames = 0;

    } else if (mode==2 && this.streamNames==0) {
      this.missionService.piNames = this.parentGroup.controls['names'].value
      this.streamNames = 3;
      await this.sharedService.postTags(8, this.missionService.piNames, this.missionService.groupId, this.missionService.groupId);
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
