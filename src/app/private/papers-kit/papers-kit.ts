import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';

import {Publication, CreatePublication, PublicationService} from '../../shared/services/publication-service';
import {People, PeopleService} from '../../shared/services/people-service';
import {UserService} from '../../user/services/user-service';

import {objectMini, SharedService} from '../../shared/services/shared-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
  selector: 'papers-kit',
  templateUrl: 'papers-kit.html',
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PapersKitComponent implements OnInit {
  @Input() groupId: string;
  @Input() sourceType: number; // 0 - regular, 1 - wall
  @Input() userId: string;
  @Input() showEditBtn: number;

  @Output() progress: EventEmitter <boolean> = new EventEmitter(true);

  streamBeginnersPublications: number[];
  streamIntermediatePublications: number[];
  streamAdvancedPublications: number[];

  publicationsBeginners: Publication[] = [];
  publicationsIntermediate: Publication[] = [];
  publicationsAdvanced: Publication[] = [];

  streamRetrieved: boolean[] = [false, false, false];
  publicationToggle: boolean[] = [false, false, false];
  streamPublicationsDelete: boolean[] = [false, false, false];

  itemFocus: number;

  dois: string[] = [];

  mode: number;

  typesFlag: boolean[] = [true, true, true, true, true, true];

  publicationBuildFlag: boolean = false;
  publicationBuild: Publication;

  constructor(public peopleService: PeopleService,
              public sharedService: SharedService,
              public publicationService: PublicationService,
              public userService: UserService) {}

  ngOnInit() {
    this.updateLibrary();
  }


  async updateLibrary() {
    this.publicationsBeginners = await this.publicationService.getPublications(20, this.groupId, 0);
    this.streamBeginnersPublications = new Array(this.publicationsBeginners.length).fill(0);
    this.publicationToggle[0]= true;
    this.streamRetrieved[0] = true;

    this.publicationsIntermediate = await this.publicationService.getPublications(21, this.groupId, 0);
    this.streamIntermediatePublications = new Array(this.publicationsIntermediate.length).fill(0);
    this.publicationToggle[1]= true;
    this.streamRetrieved[1] = true;

    this.publicationsAdvanced = await this.publicationService.getPublications(22, this.groupId, 0);
    this.streamAdvancedPublications = new Array(this.publicationsAdvanced.length).fill(0);
    this.publicationToggle[2]= true;
    this.streamRetrieved[2] = true;
  }

  pdfSlide(flag: boolean) {
    // this.publicationPDFFlag = flag
  }

  publicationSlide(mode: number, flag: boolean) {
    this.publicationBuildFlag = flag;
    this.mode = mode;
    if (this.mode==0) {
      this.dois = this.publicationsBeginners.map(r => r.doi);
    } else if (this.mode==1) {
      this.dois = this.publicationsIntermediate.map(r => r.doi);
    } else if (this.mode==2) {
      this.dois = this.publicationsAdvanced.map(r => r.doi);
    }
  }

  async publicationUpdate(event) {
    const createPublication: CreatePublication = {'type': event.type,
                                                  'title': event.title,
                                                  'parentId': this.groupId,
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
                                      'folders': null,
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

    let loc;

    if (this.mode==0) {
      this.publicationsBeginners.push(publication);
      loc = this.publicationsBeginners.length - 1;
    } else if (this.mode==1) {
      this.publicationsIntermediate.push(publication);
      loc = this.publicationsIntermediate.length - 1;
    } else if (this.mode==2) {
      this.publicationsAdvanced.push(publication);
      loc = this.publicationsAdvanced.length - 1;
    }
    this.publicationToggle[this.mode] = !this.publicationToggle[this.mode];

    this.itemFocus = loc;
    if (this.mode==0) {
      this.streamBeginnersPublications[loc] = 3;
      this.publicationsBeginners[loc]._id = await this.publicationService.putPublication(createPublication, 9+this.mode);
      this.streamBeginnersPublications[loc] = 1;
    } else if (this.mode==1) {
      this.streamIntermediatePublications[loc] = 3;
      this.publicationsIntermediate[loc]._id = await this.publicationService.putPublication(createPublication, 9+this.mode);
      this.streamIntermediatePublications[loc] = 1;
    } else if (this.mode==2) {
      this.streamAdvancedPublications[loc] = 3;
      this.publicationsAdvanced[loc]._id = await this.publicationService.putPublication(createPublication, 9+this.mode);
      this.streamAdvancedPublications[loc] = 1;
    }
    this.publicationBuildFlag = false;
  }

  async publicationDelete(checkIds: string[], j: number) {
    let indexes: number[] = [];

    this.itemFocus = null;

    if (j==0) {
      for (const id of checkIds) indexes.push(this.publicationsBeginners.findIndex(x => x._id == id));
    } else if (j==1) {
      for (const id of checkIds) indexes.push(this.publicationsIntermediate.findIndex(x => x._id == id));
    } else if (j==2) {
      for (const id of checkIds) indexes.push(this.publicationsAdvanced.findIndex(x => x._id == id));
    }

    indexes = indexes.sort((a, b) => Number(b) - Number(a)); // Sort Descending
    this.streamPublicationsDelete[j] = true;
    await this.publicationService.deletePublications(checkIds, this.groupId, 8+j);
    for (const i of indexes) {
      if (j==0) {
        this.publicationsBeginners.splice(i, 1);
      } else if (j==1) {
        this.publicationsIntermediate.splice(i, 1);
      } else if (j==2) {
        this.publicationsAdvanced.splice(i, 1);
      }
      this.streamPublicationsDelete[i] = false;
      // this.streamPublications[i]=0;
    }
    this.publicationToggle[j] = !this.publicationToggle[j];
  }

  streamPublicationsFunc(j: number) {
    if (j==0) {
      this.streamBeginnersPublications[this.itemFocus] = 0;
    } else if (j==1) {
      this.streamIntermediatePublications[this.itemFocus] = 0;
    } else if (j==2) {
      this.streamAdvancedPublications[this.itemFocus] = 0;
    }
  }
}
