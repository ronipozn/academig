import {Component, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, ActivatedRoute} from '@angular/router';

import {ProjectDetails, ProjectService} from '../../services/project-service';

import {FAQ, FaqService} from '../../services/faq-service';
import {CreatePublication, Publication, PublicationService} from '../../services/publication-service';
import {Talk, Poster, Press, MediaService} from '../../services/media-service';
import {Resource, ResourceService} from '../../services/resource-service';
import {PeopleService} from '../../services/people-service';
import {GroupService} from '../../services/group-service';

import {objectMini, SharedService} from '../../services/shared-service';

import {UserService} from '../../../user/services/user-service';

import {MetaService} from '../../services/meta-service';

import {itemsAnimation} from '../../animations/index';

@Component({
  selector: 'project-details',
  templateUrl: 'project-details.html',
  styleUrls: ['project-details.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class ProjectDetailsComponent implements OnChanges {
  @Input() parentId: string;
  @Input() projId: string;
  @Input() userId: string;
  @Input() sourceType: number;
  @Input() groupStage: number;
  @Input() showEditBtn: boolean;

  @Output() title: EventEmitter <string> = new EventEmitter(true);

  // subscriptionDrag = new Subscription();
  // subscriptionDrop = new Subscription();
  // dragIndex: number;

  itemFocus: number;

  project: ProjectDetails;

  faqs: FAQ[];
  talks: Talk[];
  posters: Poster[];
  presses: Press[];
  resources: Resource[];

  streamRetrieved: boolean[] = [];

  adminFlag: boolean;

  picBuildFlag: boolean = false;
  titleBuildFlag: boolean = false;
  miniBuildFlag: boolean[] = [false, false, false];
  descriptionBuildFlag: boolean = false;
  backgroundBuildFlag: boolean = false;
  goalsBuildFlag: boolean = false;

  pdfSlideFlag = false;
  fileTitle: string;
  fileName: string;

  faqIndex: number;
  faqNewFlag = false;
  faqBuildFlag = false;

  showcaseIndex: number;
  showcaseUpdateFlag = false;
  showcaseAddFlag = false;

  mediaIndex: number;
  mediaMode: number;
  mediaNewFlag = false;
  mediaBuildFlag = false;

  resourcesBuildFlag = false;

  streamFollow: number;
  streamPic = 0;
  streamTitle = 0;
  streamMini: number[] = [0, 0, 0];
  streamDescription = 0;
  streamBackground = 0;
  streamGoals = 0;
  streamShowcase: number[] = [];
  streamFAQ: number[];
  streamTalk: number[];
  streamPoster: number[];
  streamPress: number[];
  streamResources: number[];
  streamResourcesFollow: number[];

  //////////////////////////

  streamPublications: number[];
  streamDelete: boolean;
  streamPublicationsFolder: number[];

  typesData: number[];
  typesDataSum: number;
  typesCount: number;
  typesFlag: boolean[] = [true, true, true, true, true, true];
  publications: Publication[];

  publicationBuildFlag: boolean = false;
  publicationBuild: Publication;
  publicationToggle: boolean;

  dois: string[];

  constructor(private titleService: Title,
              private sharedService: SharedService,
              private userService: UserService,
              private projectService: ProjectService,
              private faqService: FaqService,
              private publicationService: PublicationService,
              private mediaService: MediaService,
              private resourceService: ResourceService,
              private peopleService: PeopleService,
              private groupService: GroupService,
              private metaService: MetaService,
              private _router: Router,
              private route: ActivatedRoute) {
  }

  // private getElementIndex(el: any) {
  //     return [].slice.call(el.parentElement.children).indexOf(el);
  // }

  ngOnChanges() {
    this.updatePage()
  }

  async updatePage() {
    this.streamRetrieved = [false, false, false, false, false, false, false];

    const project: ProjectDetails = await this.projectService.getProjectDetails(this.projId, this.parentId);

    if (project) {

      this.project = project;
      this.titleService.setTitle(project.name + ' | Academig'),
      this.metaService.addMetaTags(project.background ? project.background.slice(0,160) : null, null, project.name);
      this.streamRetrieved[0] = true,

      this.streamFollow = 0,
      this.adminFlag = this.showEditBtn || this.project.people.filter(r => r._id == this.userId).length ? true : false;
      this.title.emit(this.project.name)
      this.getProjectItems()

    } else {

      this.project = null;
      this.streamRetrieved = [true, true, true, true, true, true, true];
      this.title.emit('[Project not available]');

    }

  }

  async getProjectItems() {
    this.publications = await this.publicationService.getPublications(3, this.projId, 0)
    this.streamRetrieved[1] = true;
    this.publicationToggle = true;
    this.streamPublications = new Array(this.publications.length).fill(0);
    this.streamPublicationsFolder = new Array(this.publications.length).fill(0);

    this.talks = await this.mediaService.getMedia(3, this.projId, 0);
    this.streamRetrieved[2] = true;
    this.streamTalk = new Array(this.talks.length).fill(0);

    this.posters = await this.mediaService.getMedia(3, this.projId, 1);
    this.streamRetrieved[3] = true;
    this.streamPoster = new Array(this.posters.length).fill(0);

    this.presses = await this.mediaService.getMedia(3, this.projId, 2);
    this.streamRetrieved[4] = true;
    this.streamPress = new Array(this.presses.length).fill(0);

    this.resources = await this.resourceService.getResources<Resource>(3, this.projId, null, 0)
    this.streamRetrieved[5] = true;
    this.streamResources = new Array(this.resources.length).fill(0);
    this.streamResourcesFollow = new Array(this.resources.length).fill(0);

    this.faqs = await this.faqService.getFAQ(this.projId, 1);
    this.streamRetrieved[6] = true;
    this.streamFAQ = new Array(this.faqs.length).fill(0);

    // this.subscriptionDrag = this.dragulaService.drag.subscribe((args: any) => {
    //   const [bagName, el, target, source] = args;
    //   this.dragIndex = this.getElementIndex(el);
    //
    // });
    //
    // this.subscriptionDrop = this.dragulaService.drop.subscribe((args: any) => {
    //   const [bagName, el, target, source] = args;
    //   const dropIndex = this.getElementIndex(el);
    //   this.faqOrder(this.dragIndex, dropIndex)
    // });
  }

  // ngOnDestroy() {
  //   if (this.subscriptionDrag) this.subscriptionDrag.unsubscribe();
  //   if (this.subscriptionDrop) this.subscriptionDrop.unsubscribe();
  //   // this.dragulaService.destroy('faqs-bag')
  // }

  pdfSlide(flag: boolean, event) {
    this.pdfSlideFlag = flag;
    if (flag == true) {
      this.fileTitle = event.title;
      this.fileName = event.fileName;
    }
  }

  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////
  //////////////////////////////////////

  async picOp(mode: number, flag: boolean, event) {
    this.picBuildFlag = flag;

    if (mode == 1) {

      this.streamPic = 3;
      await this.sharedService.deletePic(3, this.projId);
      this.project.pic = null;
      this.streamPic = 0;

    } else if (mode == 2) {

      this.project.pic = event;
      this.streamPic = 3;
      await this.sharedService.postPic(3, this.projId, [event]);
      this.streamPic = 1;

    } else if (mode == 3) {

      this.streamPic = 0;

    }
  }

  async titleOp(mode: number, flag: boolean, event) {
    this.titleBuildFlag = flag;
    if (mode == 2) {
      this.project.name = event.text;
      this.streamTitle = 3;
      await this.sharedService.updateTitle(0, this.projId, this.parentId, event.text);
      this.streamTitle = 1;
    }
  }

  async miniOp(mode: number, type: number, flag: boolean, event) {
    this.miniBuildFlag[type] = flag;

    if (mode == 2) {
      if (type == 0) {
        this.project.people = event;
      } else if (type == 1) {
        this.project.collaborations = event;
      } else if (type == 2) {
        this.project.fundings = event;
      }
      this.streamMini[type] = 3;
      await this.sharedService.updateMinis(0, type, this.projId, this.parentId, event);
      this.streamMini[type] = 1;
    }

  }

  async descriptionOp(mode: number, flag: boolean, event) {
    this.descriptionBuildFlag = flag;

    if (mode == 1) {

      this.streamDescription = 3;

      await this.sharedService.deleteText(this.projId, null, 101);

      this.project.description = null;
      this.streamDescription = 0;

    } else if (mode == 2) {

      this.project.description = event.text
      this.streamDescription = 3;

      await this.sharedService.postText(event.text, this.projId, null, 101);

      this.streamDescription = 1;

    } else if (mode == 3) {

      this.streamDescription = 0;

    }
  }

  async backgroundOp(mode: number, flag: boolean, event) {
    this.backgroundBuildFlag = flag;

    if (mode == 1) {

      this.streamBackground = 3;

      await this.sharedService.deleteTextPic(0, this.projId, this.parentId);

      this.project.background = null;
      this.project.backgroundPic = null
      this.project.backgroundCaption = null
      this.streamBackground = 0;

    } else if (mode == 2) {

      this.project.background = event.text
      this.project.backgroundPic = event.pic;
      this.project.backgroundCaption = event.caption;

      this.streamBackground = 3;

      await this.sharedService.postTextPic(0, this.projId, this.parentId, event.text, event.pic, event.caption);

      this.streamBackground = 1;

    } else if (mode == 3) {

      this.streamBackground = 0;

    }
  }

  async goalsOp(mode: number, flag: boolean, event) {
    this.goalsBuildFlag = flag;

    if (mode == 1) {

      this.streamGoals = 3;

      await this.sharedService.deleteText(this.projId, null, 100);

      this.project.goals = null;
      this.streamGoals = 0;

    } else if (mode == 2) {

      this.project.goals = event.text
      this.streamGoals = 3;

      await this.sharedService.postText(event.text, this.projId, null, 100);

      this.streamGoals = 1;

    } else if (mode == 3) {

      this.streamGoals = 0;

    }
  }

  faqSlide(flag: boolean, i: number, newFlag: boolean) {
    this.faqIndex = i;
    this.faqBuildFlag = flag;
    this.faqNewFlag = newFlag;
  }

  async faqUpdate(event) {
    this.faqBuildFlag = false;

    const faq: FAQ = {
                      '_id': (this.faqNewFlag) ? null : this.faqs[this.faqIndex]._id,
                      'question': event.question,
                      'answer': event.answer,
                      'ai': null
                     };

    if (this.faqNewFlag == true) {

      this.faqs.push(faq);
      const loc = this.faqs.length - 1;

      this.streamFAQ[loc] = 3;
      this.itemFocus = loc;

      this.faqs[loc]._id = await this.faqService.putFAQ(faq, this.projId, 1);

      this.streamFAQ[loc] = 1;

    } else {

      this.faqs[this.faqIndex] = faq;
      this.streamFAQ[this.faqIndex] = 3;

      await this.faqService.postFAQ(faq, this.faqs[this.faqIndex]._id, this.projId, 1);

      this.streamFAQ[this.faqIndex] = 1;

    }

  }

  async faqDelete(i: number) {
    this.streamFAQ[i] = 3;

    await this.faqService.deleteFAQ(this.faqs[i]._id, this.projId, 1);

    this.faqs.splice(i, 1);
    this.streamFAQ[i] = 0;
  }

  faqStreamFunc() {
    if (this.faqNewFlag == true) {
      this.streamFAQ[this.faqs.length - 1] = 0;
    } else {
      this.streamFAQ[this.faqIndex] = 0;
    }
  }

  async faqOrder(drag: number, drop: number) {
    this.streamFAQ[drop] = 3;
    const itemId: string = this.faqs[drop]._id;

    await this.groupService.orderItems(this.projId, itemId, 1, 7, null, drag, drop);
    this.streamFAQ[drop] = 0;
  }

  async showcaseOp(mode: number, flag: boolean, event, i: number) {
    // Mode:
    // 0 - Single pic slide
    // 4 - Multplie pics slide

    if (mode < 3) {
      this.showcaseUpdateFlag = flag;
      this.showcaseIndex = i;
    } else {
      this.showcaseAddFlag = flag;
    }

    if (mode == 1) { // delete a single picture

      const _id: string = this.project.showcases[i]._id;
      this.streamShowcase[i] = 3;

      await this.sharedService.deleteShowcase(0, this.projId, this.parentId, _id);

      this.streamShowcase[i] = 0;
      this.project.showcases.splice(i, 1);

    } else if (mode == 2) { // edit a single picture

      const item: objectMini = {
                                '_id': this.project.showcases[i]._id,
                                'name': event.text,
                                'pic': event.pic
                               };

      this.project.showcases[i] = item;
      this.streamShowcase[i] = 3;

      await this.sharedService.postShowcase(0, this.projId, this.parentId, item);

      this.streamShowcase[i] = 1;

    } else if (mode == 3) { // add multple pictures

      // const picsCount = event[event.length - 2];
      const picsCount = event.substring(event.lastIndexOf("~") + 1,event.lastIndexOf("/"));
      const items: objectMini[] = [];

      for (let _i = 0; _i < picsCount; _i++) {
        items[_i] = { '_id': null, 'pic': event + 'nth/' + _i + '/', 'name': null };
      }

      for (const item of items) {
        this.project.showcases.push(item);
        this.streamShowcase[this.project.showcases.length - 1] = 3;
      }

      const newLen: number = items.length;
      let last: number = this.project.showcases.length - 1;

      const data = await this.sharedService.putShowcase(0, this.projId, this.projId, items);

      last = this.project.showcases.length - 1;
      for (const _id of data.reverse()) {
        this.project.showcases[last]._id = _id;
        last += -1;
      }

      for (let _i = 0; _i < newLen; _i++) {
        this.streamShowcase[last] = 1;
        last += -1;
      }

    }
  }

  showcaseStreamFunc(i: number): void {
    this.streamShowcase[i] = 0;
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  typesDataFunc(x: number[]): void {
    this.typesData = x;
    this.typesDataSum = this.typesData.reduce((x, y) => x + y);
    this.typesCount = this.typesData.filter(x => x>0).length;
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
                                                  'parentId': this.projId,
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
                                      'abstractPic': event.abstractPic,
                                      'abstract': event.abstract,
                                      'pdf': event.pdf,
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

    this.publications[loc]._id = await this.publicationService.putPublication(createPublication, 1);

    this.streamPublications[loc] = 1;
  }

  async publicationDelete(checkId: string[]) {
    let indexes: number[] = [];

    this.itemFocus = null;

    for (const id of checkId) {
      indexes.push(this.publications.findIndex(x => x._id == id));
    }

    indexes = indexes.sort((a, b) => Number(b) - Number(a)); // Sort Descending

    this.streamDelete = true;

    await this.publicationService.deletePublications(checkId, this.projId, 1);

    for (const i of indexes) {
      this.publications.splice(i, 1);
      this.streamDelete = false;
      // this.streamPublications[i]=0;
    }

    this.publicationToggle = !this.publicationToggle;

    // indexes.forEach((index) => {this.streamPublications[index] = 2});
  }

  async publicationFolder(event) {
    // const i: number = this.publications.findIndex(x => x._id == event[0]);
    // const folders: string[] = this.publications[i].folders;

    this.streamPublicationsFolder[event[1]] = 3;
    // await this.peopleService.toggleFollow(0, 0, event[0], toFollow);
    // this.publications[i].folders = folders;
    this.streamPublicationsFolder[event[1]] = 0;
    // this.userService.toggleFollow(toFollow,event[0],0);
  }

  typesFlagFunc(event) {
    this.typesFlag = event;
  }

  streamPublicationsFunc() {
    this.streamPublications[this.itemFocus] = 0;
  }


  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  mediaSlide(mode: number, buildFlag: boolean, i: number, newFlag: boolean) {
    this.mediaIndex = i;
    this.mediaMode = mode;
    this.mediaBuildFlag = buildFlag;
    this.mediaNewFlag = newFlag;
  }

  async mediaUpdate(event) {
    this.mediaBuildFlag = false;

    if (this.mediaMode == 0) {

      const talk: Talk = {
                          '_id': (this.mediaNewFlag) ? null : this.talks[this.mediaIndex]._id,
                          'title': event.title,
                          'location': event.location,
                          'date': event.date,
                          'text': event.abstract,
                          'link': event.link,
                          'linkConvert': event.linkConvert,
                          'presentors': event.members,
                          'projects': event.projects,
                          'group': null,
                          'profile': null,
                          'ai': null
                         };

      if (this.mediaNewFlag == true) {

        this.talks.push(talk);

        this.streamTalk[this.talks.length - 1] = 3;
        this.itemFocus = this.talks.length - 1;

        this.talks[this.talks.length - 1]._id = await this.mediaService.putMedia(talk, null, null, this.projId, 1, 0);

        this.streamTalk[this.talks.length - 1] = 1;

      } else {

        this.talks[this.mediaIndex] = talk;
        this.streamTalk[this.mediaIndex] = 3;

        await this.mediaService.postMedia(talk, null, null, this.projId, talk._id, 1, 0);

        this.streamTalk[this.mediaIndex] = 1;

      }

    } else if (this.mediaMode == 1) {

      const poster: Poster = {
                          '_id': (this.mediaNewFlag) ? null : this.posters[this.mediaIndex]._id,
                          'title': event.title,
                          'location': event.location,
                          'date': event.date,
                          'abstract': event.abstract,
                          'embed': event.linkConvert,
                          'authors': event.members,
                          'projects': event.projects,
                          'group': null,
                          'profile': null,
                          'ai': null
                         };

      if (this.mediaNewFlag == true) {

       this.posters.push(poster);

       this.streamPoster[this.posters.length - 1] = 3;
       this.itemFocus = this.posters.length - 1;

       this.posters[this.posters.length - 1]._id = await this.mediaService.putMedia(null, poster, null, this.projId, 1, 1);
       this.streamPoster[this.posters.length - 1] = 1;

      } else {

       this.posters[this.mediaIndex] = poster;
       this.streamPoster[this.mediaIndex] = 3;

       await this.mediaService.postMedia(null, poster, null, this.projId, poster._id, 1, 1);
       this.streamPoster[this.mediaIndex] = 1;

      }

    } else if (this.mediaMode == 2) {

      const press: Press = {
                          '_id': (this.mediaNewFlag) ? null : this.presses[this.mediaIndex]._id,
                          'title': event.title,
                          'abstract': event.abstract,
                          'source': event.location,
                          'date': event.date,
                          'link': event.link,
                          'projects': event.projects,
                          'group': null,
                          'profile': null,
                          'ai': null
                         };

     if (this.mediaNewFlag == true) {

       this.presses.push(press);

       this.streamPress[this.presses.length - 1] = 3;
       this.itemFocus = this.presses.length - 1;

       this.presses[this.presses.length - 1]._id = await this.mediaService.putMedia(null, null, press, this.projId, 1, 2);
       this.streamPress[this.presses.length - 1] = 1;

     } else {

       this.presses[this.mediaIndex] = press;
       this.streamTalk[this.mediaIndex] = 3;

       await this.mediaService.postMedia(null, null, press, this.projId, press._id, 1, 2);
       this.streamPress[this.mediaIndex] = 1;

     }
   }
  }

  async mediaDelete(mode: number, i: number) {
    this.itemFocus = null;
    let _id: string

    if (mode == 0) {
      _id = this.talks[i]._id;
      this.streamTalk[i] = 3;
    } else if (mode == 1) {
      _id = this.posters[i]._id;
      this.streamPoster[i] = 3;
    } else if (mode == 2) {
      _id = this.presses[i]._id;
      this.streamPress[i] = 3;
    }

    await this.mediaService.deleteMedia(_id, this.projId, 1, mode);

    if (mode == 0) {
      this.talks.splice(i, 1);
      this.streamTalk[i] = 0;
    } else if (mode == 1) {
      this.posters.splice(i, 1);
      this.streamPoster[i] = 0;
    } else if (mode == 2) {
      this.presses.splice(i, 1);
      this.streamPress[i] = 0;
    }
  }

  mediaStreamFunc(mode: number) {
    let loc: number;

    if (mode == 0) {
      loc = this.mediaNewFlag ? this.talks.length - 1 : this.mediaIndex;
      this.streamTalk[loc] = 0;
    } else if (mode == 1) {
      loc = this.mediaNewFlag ? this.posters.length - 1 : this.mediaIndex;
      this.streamPoster[loc] = 0;
    } else if (mode == 2) {
      loc = this.mediaNewFlag ? this.presses.length - 1 : this.mediaIndex;
      this.streamPress[loc] = 0;
    }
  }

  async resourcesOp(mode: number, flag: boolean, event, i) {
    this.resourcesBuildFlag = flag;

    if (mode == 1) {

      const _id = this.resources[i]._id;
      this.streamResources[i] = 3;

      await this.projectService.pullResource(this.projId, _id);

      this.resources.splice(i, 1);
      this.streamResources[i] = 0;

    } else if (mode == 2) {

      this.resources.push(event.resource);
      const loc = this.resources.length - 1;

      this.streamResources[loc] = 3;
      this.streamResourcesFollow[loc] = 0;
      this.itemFocus = loc;

      await this.projectService.pushResource(this.projId, event.resource._id);

      this.streamResources[loc] = 1;

    }
  }

  async projectFollow() {
    const itemId: string = this.project._id;
    const toFollow: boolean = !this.project.followStatus;
    this.streamFollow = 3;
    await this.peopleService.toggleFollow(2, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "project");
    this.streamFollow = 0;
    this.project.followStatus = toFollow;
  }

  animationDone(i: number, j: number): void {
    if (j <= 2) {
      this.streamMini[j] = 0;
    } else if (j == 3) {
      this.streamTitle = 0;
    }
  }

  streamResourcesFunc() {
    this.streamResources[this.resources.length - 1] = 0;
  }

}
