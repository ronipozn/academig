import {Component, OnInit, Input, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
// import { MetaService } from '../shared/services/meta-service';

import {Folder, Publication, CreatePublication, PublicationService} from '../../shared/services/publication-service';
import {People, PeopleService} from '../../shared/services/people-service';

import {UserService} from '../../user/services/user-service';
import {MissionService} from '../services/mission-service';

import {itemsAnimation} from '../../shared/animations/index';

export interface CreatedData {
  _id: string;
  folders: Folder[];
}

import * as moment from 'moment';

@Component({
  selector: 'library',
  templateUrl: 'library.html',
  styleUrls: ['library.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class LibraryComponent implements OnInit {
  publications: Publication[] = [];
  publicationsDup: Publication[] = [];

  streamRetrieved: boolean = false;
  publicationToggle: boolean = false;
  foldersToggle: boolean = false;

  // statsData: number[];
  // typesData: number[];
  // typesDataSum: number;
  // typesCount: number;
  typesFlag: boolean[] = [true, true, true, true, true, true];

  refinements: string[] = [];
  folderQuery: string;

  streamPublications: number[];
  streamPublicationsFolder: number[];

  foldersCount = {};

  publicationBuildFlag: boolean = false;
  publicationBuild: Publication;

  dois: string[] = [];

  userRead: number = 0;
  challengeGoal: number;

  expandFlag: boolean;

  itemFocus: number;

  streamPublicationsDelete: boolean;

  streamFolderRemove: string;

  //////////////////////////

  readBuildFlag: boolean;
  readBuildMode: number;
  // folderReadBuild: Folder;
  folderIndex: number;
  // publicationRead: Publication;
  publicationIndex: number;

  constructor(private titleService: Title,
              private peopleService: PeopleService,
              private publicationService: PublicationService,
              public missionService: MissionService,
              private userService: UserService,
              private route: ActivatedRoute) {
    this.titleService.setTitle('Reading Library | Academig');
  }

  ngOnInit() {
    this.updateLibrary();
  }

  async updateLibrary() {
    this.publications = await this.publicationService.getPublications(19, this.missionService.peopleId, 0);

    // console.log('publications',this.publications)

    const folders: string[] = ([].concat(...Object.values(this.publications.map(r => r.folders)))).map(x => x ? x.folder : null)
    folders.forEach((folder) => {this.foldersCount[folder] = ++this.foldersCount[folder] || 1});

    this.publicationsDup = this.publications.slice(0); // avoid mutating;

    // console.log('this.publicationsDup',this.publicationsDup)

    this.streamPublications = new Array(this.publications.length).fill(0);
    this.streamPublicationsFolder = new Array(this.publications.length).fill(0);
    this.publicationToggle = true;
    this.streamRetrieved = true;

    if (this.userService.userFolders) {
      this.userService.userFolders.forEach((userFolder) => {
        if (this.foldersCount[userFolder.folder]==null) this.foldersCount[userFolder.folder] = 0;
      })
      const userFolder: Folder = this.userService.userFolders.find(r=>r.folder=="read");
      this.userRead = userFolder ? userFolder.count : 0;
    } else {
      this.userRead = 0;
    }

    this.route.queryParams.subscribe(queryParam => {
      this.folderQuery = queryParam.folder;
      if (this.folderQuery) this.foldersFilterFunc(queryParam.folder, true)
    })
  }

  readAddSlide(id: string, flag: boolean) {
    const i: number = this.publicationsDup.findIndex(x => x._id == id);

    this.readBuildFlag = flag;
    if (flag==true) {
      this.readBuildMode = 0;
      this.publicationIndex = i;
    }
  }

  readEditSlide(event, flag: boolean) {
    // console.log('readEditSlide',event)
    const i: number = this.publicationsDup.findIndex(x => x._id == event[0]);

    this.readBuildFlag = true;
    this.readBuildMode = 1;
    this.publicationIndex = i;
    this.folderIndex = event[1];
  }

  async readEditUpdate(event) {
    // console.log('readEditUpdate',event)
    this.readBuildFlag = false;
    this.publicationsDup[this.publicationIndex].folders[this.folderIndex].summary = event.summary
    this.publicationsDup[this.publicationIndex].folders[this.folderIndex].privacy = event.privacy
    this.publicationsDup[this.publicationIndex].folders[this.folderIndex].date = moment(event.date).toDate();
    this.publicationsDup[this.publicationIndex].folders[this.folderIndex].end = moment(event.end).toDate();
    this.publicationsDup[this.publicationIndex].folders[this.folderIndex].rating = event.rating
    this.publicationsDup[this.publicationIndex].folders[this.folderIndex].feed = event.feed[0]
    // console.log("111",this.publicationsDup[this.publicationIndex]._id)
    // console.log("222",this.publicationsDup[this.publicationIndex].folders[this.folderIndex])
    await this.peopleService.updateReadFolder(this.publicationsDup[this.publicationIndex]._id, this.publicationsDup[this.publicationIndex].folders[this.folderIndex]);
  }

  async readRemove(event) {
    const i: number = this.publicationsDup.findIndex(x => x._id == event[0]);

    await this.peopleService.removeReadFolder(this.publicationsDup[i]._id, this.publicationsDup[i].folders[event[1]]._id);
    this.publicationsDup[i].folders.splice(event[1],1);
  }

  async publicationFolder(event) {
    // console.log('publicationFolder',event)
    const folder: Folder = {
      _id: event[2]._id,
      folder: event[2].folder,
      count: null,
      date: event[2].date, //event[2].start,
      end: event[2].end,
      summary: event[2].summary,
      privacy: event[2].privacy,
      rating: event[2].rating,
      recommend: event[2].recommend,
      recommended: event[2].recommended,
      feed: event[2].feed ? event[2].feed[0] : false
    }
    const i: number = this.publicationsDup.findIndex(x => x._id == event[0]);
    const checked: boolean = event[2].checked;

    if (this.userService.userId) {
      this.streamPublicationsFolder[event[1]] = 3;
      const folderId = await this.peopleService.toggleFolder(event[0], folder, checked);
      if (folder.folder=='read') {
        const userFolder = this.userService.userFolders.find(r=>r.folder=="read");
        folder._id = folderId;
        if (userFolder) {
          this.userService.userFolders.find(r=>r.folder=="read").count++
          this.userRead = userFolder.count;
        } else {
          this.userService.userFolders["read"] = 1;
          this.userRead = 1;
        }
      }
      this.foldersCount[folder.folder] = checked ? (++this.foldersCount[folder.folder] || 1) : (--this.foldersCount[folder.folder]);

      const stickFlag: boolean = folder.folder=="want" || folder.folder=="read" || folder.folder=="current";

      if (this.missionService.meFlag) {
        // this.userService.toggleFolder(folder.folder);
        if (!stickFlag && !checked) this.publicationsDup[i].folders = this.publicationsDup[i].folders.filter(r => (r.folder!=folder.folder));
        if (checked) {
          if (this.publicationsDup[i].folders) {
            if (folder.folder=="want" || folder.folder=="current") this.publicationsDup[i].folders = this.publicationsDup[i].folders.filter(r => (r.folder!="want" && r.folder!="current"));
            this.publicationsDup[i].folders.push(folder); // this.publications[event[1]].folders.push(folder);
          } else {
            this.publicationsDup[i].folders=[folder];
          }
          if (!stickFlag) this.userService.toggleFolder(folder.folder);
        }
      } else {
        if (!stickFlag && !checked) this.publicationsDup[i].userFolders = this.publicationsDup[i].userFolders.filter(r => (r.folder!=folder.folder));
        if (checked) {
          if (this.publicationsDup[i].userFolders) {
            if (folder.folder=="want" || folder.folder=="current") this.publicationsDup[i].userFolders = this.publicationsDup[i].userFolders.filter(r => (r.folder!="want" && r.folder!="current"));
            this.publicationsDup[i].userFolders.push(folder); // this.publications[event[1]].userFolders.push(folder);
          } else {
            this.publicationsDup[i].userFolders=[folder];
          }
          if (!stickFlag) this.userService.toggleFolder(folder.folder);
        }
      }

      this.readBuildFlag = false;
      this.streamPublicationsFolder[event[1]] = 0;
      this.foldersToggle=!this.foldersToggle;

    } else {
      // this.action = "reading library";
      // this.toggleSignUp.nativeElement.click();
    }
  }

  async folderRemoveFunc(folderName: string) {
    const folder: Folder = {
      _id: null,
      folder: folderName,
      count: null,
      date: null,
      end: null,
      summary: null,
      privacy: null,
      rating: null,
      recommend: null,
      recommended: null,
      feed: null
    }
    this.streamFolderRemove = folderName;
    await this.peopleService.toggleFolder(null, folder, false, 1);
    delete this.foldersCount[folderName]
    this.userService.userFolders = this.userService.userFolders.filter(r => (r.folder!=folderName))
    this.streamFolderRemove = null;
  }

  foldersFilterFunc(folder: string, checked: boolean) {
    if (checked) {
      this.refinements.push(folder);
    }  else {
      this.refinements = this.refinements.filter(item => item!==folder);
    }

    if (this.refinements.length==0) {
      this.publicationsDup = this.publications.slice(0);
    } else {
      this.publicationsDup = this.publications.slice(0).filter(
        r => this.areCommonElements(r.folders.map(f=>f.folder),this.refinements)
      )
    }
    this.publicationToggle=!this.publicationToggle;
  }

  // https://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-element-of-another-array-in-javascript/29447130
  areCommonElements = (arr1, arr2) => {
    const [shortArr, longArr] = (arr1.length < arr2.length) ? [arr1, arr2] : [arr2, arr1];
    const longArrSet = new Set(longArr);
    return shortArr.some(el => longArrSet.has(el));
  };

  pdfSlide(flag: boolean) {
    // this.publicationPDFFlag = flag
  }

  publicationSlide(mode: number, flag: boolean) {
    this.publicationBuildFlag = flag;
    this.dois = this.publicationsDup.map(r => r.doi);
  }

  async publicationUpdate(event) {
    const createPublication: CreatePublication = {'type': event.type,
                                                  'title': event.title,
                                                  'parentId': null,
                                                  'folders': [event.stickFolder].concat(event.extraFolders),
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

    const stickObj: Folder = ({"_id": null, "folder": event.stickFolder, "count": null, "date": new Date(), "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null});
    const extraObj: Folder[] = event.extraFolders.map(e => ({"folder": e, "count": null, "date": new Date(), "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null}));

    this.foldersCount[event.stickFolder] = ++this.foldersCount[event.stickFolder] || 1;
    if (event.stickFolder=="current") --this.foldersCount["want"]
    if (event.stickFolder=="want") --this.foldersCount["current"]

    event.extraFolders.forEach((folder) => {this.foldersCount[folder] = ++this.foldersCount[folder] || 1});

    const publication: Publication = {'_id': null,
                                      'type': event.type,
                                      'title': event.title,
                                      'views': [0, 0, 0, 0, 0],
                                      'folders': [stickObj].concat(extraObj),
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
    this.publicationsDup.push(publication);
    this.publicationToggle = !this.publicationToggle;

    const loc = this.publicationsDup.length - 1;

    this.streamPublications[loc] = 3;
    this.streamPublicationsFolder[loc] = 0;
    this.itemFocus = loc;

    // this.publicationsDup[loc]._id = await this.publicationService.putPublication(createPublication, 8);
    const created: CreatedData = await this.publicationService.putPublication(createPublication, 8);

    this.publicationsDup[loc]._id = created._id;
    this.publicationsDup[loc].folders = created.folders;

    this.streamPublications[loc] = 1;

    this.publicationBuildFlag = false;
    // var flatten = this.tags.concat(event.tags);
    // this.tags  = Array.from(new Set(flatten));
  }

  async publicationDelete(checkIds: string[]) {
    let indexes: number[] = [];

    this.itemFocus = null;

    for (const id of checkIds) {indexes.push(this.publications.findIndex(x => x._id == id))}
    indexes = indexes.sort((a, b) => Number(b) - Number(a)); // Sort Descending
    this.streamPublicationsDelete = true;
    await this.publicationService.deletePublications(checkIds, this.missionService.peopleId, 7);
    for (const i of indexes) {
      // this.publications.splice(i, 1);
      this.publicationsDup.splice(i, 1);
      this.streamPublicationsDelete = false;
    }
    this.publicationToggle = !this.publicationToggle;
  }

  streamPublicationsFunc() {
    this.streamPublications[this.itemFocus] = 0;
  }

}
