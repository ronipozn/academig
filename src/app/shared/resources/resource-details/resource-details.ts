import {Component, Input, OnDestroy, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import {Router, ActivatedRoute} from '@angular/router';

import {AuthService} from '../../../auth/auth.service';

import {ResourceDetails, ResourceService} from '../../services/resource-service';
import {ServicePriceType, serviceTypes, Price, Core, Code, Inventory, Equipment} from '../../services/resource-service';
import {featuresStandard, featuresGood, featuresBest} from '../../../shared/services/resource-service';

import {FAQ, FaqService} from '../../services/faq-service';
import {CreatePublication, Publication, PublicationService} from '../../services/publication-service';
import {PeopleService} from '../../services/people-service';
import {GroupService} from '../../services/group-service';
import {objectMini, Link, SharedService} from '../../services/shared-service';

import {UserService} from '../../../user/services/user-service';

import {MetaService} from '../../services/meta-service';

import {itemsAnimation} from '../../animations/index';

@Component({
  selector: 'resource-details',
  templateUrl: 'resource-details.html',
  styleUrls: ['resource-details.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class ResourceDetailsComponent implements OnDestroy {
  @Input() parentId: string;
  @Input() projId: string;
  @Input() userId: string;
  @Input() sourceType: number;
  @Input() showEditBtn: boolean;

  @Output() title: EventEmitter <string> = new EventEmitter(true);

  itemFocus: number;

  resource: ResourceDetails;

  faqs: FAQ[];

  streamRetrieved: boolean[] = [];
  publicationToggle: boolean;

  priceBuildFlag: boolean = false;

  adminFlag: boolean;

  picBuildFlag: boolean = false;
  titleBuildFlag: boolean = false;
  miniBuildFlag: boolean[] = [false, false];
  tagsBuildFlag: boolean = false;

  backgroundBuildFlag = false;
  descriptionBuildFlag = false;
  termsBuildFlag = false;
  publicationsBuildFlag = false;

  galleryIndex: number;
  galleryUpdateFlag = false;
  galleryAddFlag = false;

  linkIndex: number;
  linkNewFlag = false;
  linkBuildFlag = false;

  faqIndex: number;
  faqNewFlag = false;
  faqBuildFlag = false;

  tableIndex: number;
  tableNewFlag = false;
  tableBuildFlag = false;
  tableBuildMode: number;
  tableBuildHeadline: string;

  streamFollow: number;
  streamHold: number;
  streamFinalize: number;
  streamDelete: number;

  streamTitle = 0;
  streamPic = 0;
  streamPrice = 0;
  streamMini: number[] = [0, 0];
  streamTags = 0;
  streamBackground = 0;
  streamDescription = 0;
  streamTerms = 1; // special
  streamGallery: number[] = [];
  streamFAQ: number[];
  streamLink: number[];
  streamTable: number[][];

  pdfSlideFlag = false;
  pdfTitle: string;
  pdfFileName: string;

  //////////////////////////

  streamPublications: number[];
  streamPublicationDelete: boolean = false;
  streamPublicationsFolder: number[];

  typesData: number[];
  typesDataSum: number;
  typesCount: number;
  typesFlag: boolean[] = [true, true, true, true, true, true];
  publications: Publication[];

  publicationBuildFlag: boolean = false;
  publicationIndex: number;
  publicationBuild: Publication;

  dois: string[];

  // currencySymbols = ['usd', 'eur', 'gbp', 'ils', 'krw', 'rub', 'inr', 'jpy', 'jpy'];
  currencySymbols = ['$', '€', '£', '₪', '₩', '₽', '₹', '¥', '元'];
  serviceSelect = serviceTypes;
  servicePriceType = ServicePriceType;

  streamRequest: boolean = false;

  action: string;

  isAuthenticated: boolean = false;

  thresholdStandout: number[] = [0, 3, 5, 7];
  titlesStandout: string[] = ['STANDARD', 'GOOD', 'BETTER', 'BEST'];
  featuresStandout: string[];

  featuresStandard = featuresStandard;
  featuresGood = featuresGood;
  featuresBest = featuresBest;

  howSelect = ["Requests made through Academig platform.", "Send an email directly to:", "Direct visitors to an external site to apply:"];

  @ViewChild('toggleWithdrawModal', { static: true }) toggleWithdraw: ElementRef;
  @ViewChild('toggleRequestModal', { static: true }) toggleRequest: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;
  @ViewChild('toggleCancelModal', { static: true }) toggleCancel: ElementRef;

  constructor(private titleService: Title,
              private resourceService: ResourceService,
              private publicationService: PublicationService,
              private faqService: FaqService,
              private peopleService: PeopleService,
              private groupService: GroupService,
              private userService: UserService,
              private sharedService: SharedService,
              private router: Router,
              private authService: AuthService,
              private metaService: MetaService,
              private _router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.authService.isAuthenticated.subscribe(value => {
      this.isAuthenticated = value;
    });
  }

  ngOnChanges() {
    this.resource = null;
    this.publications = null;
    this.faqs = null;
    this.updatePage()
  }

  ngOnDestroy() {
    // if (this.subscriptionDrag) this.subscriptionDrag.unsubscribe();
    // if (this.subscriptionDrop) this.subscriptionDrop.unsubscribe();
    // this.dragulaService.destroy('faqs-bag')
  }

  async updatePage() {
    this.streamRetrieved = [false, false, false];

    const resource: ResourceDetails = await this.resourceService.getResourceDetails(this.projId, this.parentId);

    if (resource) {

      // console.log('resource',resource)
      this.resource = resource;
      this.titleService.setTitle(resource.name + ' | Academig');
      this.metaService.addMetaTags(resource.description ? resource.description.slice(0,160) : null, resource.tags ? resource.tags.toString() : null, resource.name);
      this.streamRetrieved[0] = true;

      this.streamFollow = 0;
      this.adminFlag = this.showEditBtn || (this.sourceType!=5 && this.resource.people && this.resource.people.filter(r => r._id == this.userId).length ? true : false);
      this.title.emit(this.resource.name);

      this.streamLink = new Array(this.resource.links.length).fill(0);

      this.streamTable = [(new Array(this.resource.manuals.length).fill(0))];
      this.streamTable.push(new Array(this.resource.codes.length).fill(0));
      this.streamTable.push(new Array(this.resource.cads.length).fill(0));
      this.streamTable.push(new Array(this.resource.inventories.length).fill(0));
      this.streamTable.push(new Array(this.resource.equipments.length).fill(0));

      this.resource.standout = 1;

      switch (this.resource.standout) {
        case 0: this.featuresStandout = this.featuresStandard; break;
        case 1: this.featuresStandout = this.featuresGood; break;
        case 2: this.featuresStandout = this.featuresBest; break;
      };

      this.getResourcePublications();
      this.getResourceFAQ();

    } else {

      this.resource = null,
      this.streamRetrieved = [true, true, true];
      this.title.emit('[Resource not available]');

    }
  }

  // getResourceItems() {
  async getResourcePublications() {
    this.publications = await this.publicationService.getPublications(4, this.projId, 0);

    this.streamRetrieved[1] = true;
    this.publicationToggle = true;
    this.streamPublications = new Array(this.publications.length).fill(0);
    this.streamPublicationsFolder = new Array(this.publications.length).fill(0);
  }

  async getResourceFAQ() {
    this.faqs = await this.faqService.getFAQ(this.projId, 2);

    this.streamRetrieved[2] = true;
    this.streamFAQ = new Array(this.faqs.length).fill(0);

    // this.subscriptionDrag = this.dragulaService.drag.subscribe((args: any) => {
    //   const [bagName, el, target, source] = args;
    //   this.dragIndex = this.getElementIndex(el);
    // });
    //
    // this.subscriptionDrop = this.dragulaService.drop.subscribe((args: any) => {
    //   const [bagName, el, target, source] = args;
    //   const dropIndex = this.getElementIndex(el);
    //   this.faqOrder(this.dragIndex, dropIndex)
    // });
  }

  private getElementIndex(el: any) {
      return [].slice.call(el.parentElement.children).indexOf(el);
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  openRequestModalFunc() {
    if (this.userService.userEmailVerified) {
      this.toggleRequest.nativeElement.click();
    } else {
      this.action = "request";
      this.toggleSignUp.nativeElement.click();
    }
  }

  manageRequestOp() {
    this.router.navigate(['/manage-services'], { queryParams: { 'id': this.projId} });
  }

  async requestOp(form) {
    this.streamRequest = true;

    if (this.resource.how==1) {
      // await this.resourceService.postRequest(this.projId, 1, null);
      (window as any).open("mailto:"+this.resource.direct, "_blank");
    } else if (this.resource.how==2) {
      // await this.resourceService.postRequest(this.projId, 2, null);
      (window as any).open(this.resource.direct, "_blank");
    } else {
      await this.resourceService.postRequest(this.projId, form.value.messageRequest);
      this.resource.requests = [
        {
          channelId: null,
          date: new Date(),
          userId: this.userService.userId,
        }
      ];
    }

    this.toggleRequest.nativeElement.click();
    this.streamRequest = false;
    form.reset();
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async priceOp(mode: number, flag: boolean, event) {
    this.priceBuildFlag = flag;

    if (mode == 2) {
      const priceObj: Price = (event.priceRequest && event.priceRequest[0]) ? {
        'type': event.priceType,
        'request': event.priceRequest[0],
        'range': event.priceRange[0],
        'price': [Number(event.priceStart), event.priceRange[0] ? Number(event.priceEnd) : null],
        'mode': event.priceMode,
        'currency': null, // event.priceCurrency,
        'internalId': event.priceInternalId
      } : null;
      this.resource.price = priceObj
      this.streamPrice = 3;
      await this.resourceService.postPrice(this.projId, priceObj);
      this.streamPrice = 0;
    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async picOp(mode: number, flag: boolean, event) {
    this.picBuildFlag = flag;

    if (mode == 1) {

      this.streamPic = 3;
      await this.sharedService.deletePic(4, this.projId);
      this.resource.pic = null;
      this.streamPic = 0;

    } else if (mode == 2) {

      this.resource.pic = event;
      this.streamPic = 3;
      await this.sharedService.postPic(4, this.projId, [event]);
      this.streamPic = 1;

    } else if (mode == 3) {

      this.streamPic = 0;

    }
  }

  async titleOp(mode: number, flag: boolean, event) {
    this.titleBuildFlag = flag;

    if (mode == 2) {
      this.resource.name = event.text;
      this.streamTitle = 3;
      await this.sharedService.updateTitle(1, this.projId, this.parentId, event.text);
      this.streamTitle = 1;;
    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async miniOp(mode: number, type: number, flag: boolean, event) {
    this.miniBuildFlag[type] = flag;

    if (mode == 2) {

      if (type == 0) {
        this.resource.people = event
      } else if (type == 1) {
        this.resource.projects = event;
      }

      this.streamMini[type] = 3;

      await this.sharedService.updateMinis(1, type, this.projId, this.parentId, event);

      this.streamMini[type] = 1;

    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async tagsOp(mode: number, flag: boolean, event) {
    this.tagsBuildFlag = flag;

    if (mode == 1) {

      this.streamTags = 3;
      await this.sharedService.deleteTags(3, this.projId, this.parentId);
      this.resource.tags = [];
      this.streamTags = 0;

     } else if (mode == 2) {

      // TBD: Algolia
      this.resource.tags = event;
      this.streamTags = 3;
      await this.sharedService.postTags(3, this.resource.tags, this.projId, this.parentId);
      this.streamTags = 1;

    }
  }

  tagClickOp(i: number) {
    this.userService.searchText = this.resource.tags[i];
    this.router.navigate(['/search/services']);
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async backgroundOp(mode: number, flag: boolean, event) {
    this.backgroundBuildFlag = flag;
    if (mode == 1) {

      this.streamBackground = 3;

      await this.sharedService.deleteTextPic(3, this.projId, this.parentId);

      this.resource.background = null;
      this.resource.backgroundPic = null
      this.resource.backgroundCaption = null
      this.streamBackground = 0;

     } else if (mode == 2) {

      this.resource.background = event.text
      this.resource.backgroundPic = event.pic;
      this.resource.backgroundCaption = event.caption;

      this.streamBackground = 3;

      await this.sharedService.postTextPic(3, this.projId, this.parentId, event.text, event.pic, event.caption);

      this.streamBackground = 1;

     } else if (mode == 3) {

      this.streamBackground = 0;

     }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async descriptionOp(mode: number, flag: boolean, event) {
    this.descriptionBuildFlag = flag;
    if (mode == 1) {

      this.streamDescription = 3;

      await this.sharedService.deleteTextPic(12, this.projId, this.parentId);

      this.resource.description = null;
      this.resource.descriptionPic = null;
      this.resource.descriptionCaption = null;
      this.streamDescription = 0;

     } else if (mode == 2) {

      this.resource.description = event.text
      this.resource.descriptionPic = event.pic;
      this.resource.descriptionCaption = event.caption;
      this.streamDescription = 3;

      await this.sharedService.postTextPic(12, this.projId, this.parentId, event.text, event.pic, event.caption);

      this.streamDescription = 1;

     } else if (mode == 3) {

      this.streamDescription = 0;

     }

  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async termsOp(mode: number, flag: boolean, event) {
    this.termsBuildFlag = flag;

    if (mode == 1) {

      this.streamTerms = 3;

      await this.resourceService.deleteTerms(this.projId);

      this.resource.termsMode = 0;
      this.resource.termsMore = null;
      this.streamTerms = 1;

    } else if (mode == 2) {

      this.resource.termsMode = event.mode
      this.resource.termsMore = event.more ? event.more : null

      this.streamTerms = 3;

      await this.resourceService.postTerms(this.resource.termsMode, this.resource.termsMore, this.projId);

      this.streamTerms = 1;

    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async galleryOp(mode: number, flag: boolean, event, i) {
    // 0 - Single pic slide
    // 4 - Multplie pics slide

    if (mode < 3) {
      this.galleryUpdateFlag = flag;
      this.galleryIndex = i;
    } else {
      this.galleryAddFlag = flag;
    }

    if (mode == 1) { // delete a single picture

      const _id: string = this.resource.gallery[i]._id;
      this.streamGallery[i] = 3;

      await this.sharedService.deleteShowcase(1, this.projId, this.parentId, _id);

      this.streamGallery[i] = 0;
      this.resource.gallery.splice(i, 1);

    } else if (mode == 2) { // edit a single picture
      const item: objectMini = {
                                '_id': this.resource.gallery[i]._id,
                                'name': event.text,
                                'pic': event.pic
                               };

      this.resource.gallery[i] = item;
      this.streamGallery[i] = 3;

      await this.sharedService.postShowcase(1, this.projId, this.parentId, item);

      this.streamGallery[i] = 1;

    } else if (mode == 3) { // add multiple pictures

      // const picsCount = event[event.length - 2];
      const picsCount = event.substring(event.lastIndexOf("~") + 1,event.lastIndexOf("/"));
      const items: objectMini[] = [];

      for (let _i = 0; _i < picsCount; _i++) {
        items[_i] = { '_id': null, 'pic': event + 'nth/' + _i + '/', 'name': null };
      }

      for (const item of items) {
        this.resource.gallery.push(item);
        this.streamGallery[this.resource.gallery.length - 1] = 3;
      }

      const newLen: number = items.length;
      let last: number;

      const data = await this.sharedService.putShowcase(1, this.projId, this.projId, items);

      last = this.resource.gallery.length - 1;
      for (const _id of data.reverse()) {
        this.resource.gallery[last]._id = _id;
        last += -1;
      }

      for (let _i = 0; _i < newLen; _i++) {
        this.streamGallery[last] = 1;
        last += -1;
      }

      // err
      // for (let _i = 0; _i < newLen; _i++) {
      //   this.streamGallery[last] = 2;
      //   last += -1;
      // }
    }

  }

  galleryStreamFunc(i: number): void {
    this.streamGallery[i] = 0;
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
                                      'abstract': event.abstract,
                                      'abstractPic': event.abstractPic,
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

    this.publications[loc]._id = await this.publicationService.putPublication(createPublication, 2);
    this.streamPublications[loc] = 1;
  }

  async publicationDelete(checkId: string[]) {
    let indexes: number[] = [];

    this.itemFocus = null;

    for (const id of checkId) {
      indexes.push(this.publications.findIndex(x => x._id == id));
    }

    indexes = indexes.sort((a, b) => Number(b) - Number(a)); // Sort Descending

    this.streamPublicationDelete = true;

    await this.publicationService.deletePublications(checkId, this.projId, 2);

    for (const i of indexes) {
      // console.log('i', i)
      this.publications.splice(i, 1);
      this.streamPublicationDelete = false;
      // this.streamPublications[i]=0;
    }
    this.publicationToggle = !this.publicationToggle;
  }

  async publicationFolder(event) {
    // const i: number = this.publications.findIndex(x => x._id == event[0]);
    // const folders: string[] = this.publications[i].folders;

    this.streamPublicationsFolder[event[1]] = 3;
    // await this.peopleService.toggleFollow(0, 0, event[0], toFollow);
    // this.publications[i].folders = folders;
    this.streamPublicationsFolder[event[1]] = 0;
    // this.userService.toggleFollow(toFollow, event[0], 0);
  }

  typesFlagFunc(event) {
    this.typesFlag = event;
  }

  streamFunc(modeNum: number) {
    this.streamPublications[this.itemFocus] = 0;
  }


  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  linkSlide(flag: boolean, i: number, newFlag: boolean) {
    this.linkIndex = i;
    this.linkBuildFlag = flag;
    this.linkNewFlag = newFlag;
  }

  async linkUpdate(event) {
    this.linkBuildFlag = false;

    const link: Link = {
                        '_id': (this.linkNewFlag) ? null : this.resource.links[this.linkIndex]._id,
                        'name': event.name,
                        'link': event.link,
                        'description': event.description,
                       };

    if (this.linkNewFlag == true) {

      this.resource.links.push(link);

      this.streamLink[this.resource.links.length - 1] = 3;
      this.itemFocus = this.resource.links.length - 1;

      this.resource.links[this.resource.links.length - 1]._id = await this.sharedService.putLink(link, this.projId, 1);
      this.streamLink[this.resource.links.length - 1] = 1;

    } else {

      this.resource.links[this.linkIndex] = link;
      this.streamLink[this.linkIndex] = 3;

      await this.sharedService.postLink(link, this.projId, 1);
      this.streamLink[this.linkIndex] = 1;

    }

  }

  async linkDelete(i: number) {
    this.streamLink[i] = 3;

    await this.sharedService.deleteLink(this.resource.links[i]._id, this.projId, 1);
    this.resource.links.splice(i, 1);
    this.streamLink[i] = 0;
  }

  linkStreamFunc() {
    if (this.linkNewFlag == true) {
      this.streamLink[this.resource.links.length - 1] = 0;
    } else {
      this.streamLink[this.linkIndex] = 0;
    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

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

      this.faqs[loc]._id = await this.faqService.putFAQ(faq, this.projId, 2);

      this.streamFAQ[loc] = 1;

    } else {

      this.faqs[this.faqIndex] = faq;
      this.streamFAQ[this.faqIndex] = 3;

      await this.faqService.postFAQ(faq, this.faqs[this.faqIndex]._id, this.projId, 2);

      this.streamFAQ[this.faqIndex] = 1;

    }

  }

  async faqDelete(i: number) {
    this.streamFAQ[i] = 3;

    await this.faqService.deleteFAQ(this.faqs[i]._id, this.projId, 2);

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

    await this.groupService.orderItems(this.projId, itemId, 2, 7, null, drag, drop);
    this.streamFAQ[drop] = 0;
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  tableOp(event, flag: boolean, mode: number) {
    if (mode == 0) { // Show Slide - New
      this.tableNewFlag = true;
      this.tableBuildHeadline = event.headline;
      this.tableBuildMode = event.mode;
    } else if (mode == 1) { // Show Slide - Update
      this.tableNewFlag = false;
      this.tableBuildHeadline = event.headline;
      this.tableIndex = event.index;
      this.tableBuildMode = event.mode;
    } else if (mode == 2) { // Delete item
      this.tableDelete(event.index, event.mode)
    } else if (mode == 3) { // Update item
      this.tableUpdate(this.tableIndex, this.tableBuildMode, event)
      // this.tableIndex=event.index;
    }

    this.tableBuildFlag = flag;
  }

  async tableUpdate(i: number, mode: number, event) {
    let loc: number;

    let manual: Core
    let code: Code
    let cad: Core
    let inventory: Inventory
    let equipment: Equipment

    // console.log('eventttt',event)

    switch (mode) {
      case 0: {
        manual = {'_id': this.tableNewFlag ? null : this.resource.manuals[this.tableIndex]._id,
                  'name': event.name,
                  'version': event.version,
                  'date': event.date,
                  'description': event.description,
                  'files': event.files};

        if (this.tableNewFlag) {
          this.resource.manuals.push(manual);
          loc = this.resource.manuals.length - 1;
        } else {
          this.resource.manuals[this.tableIndex] = manual;
        }
        break;
      }
      case 1: {
        code = {'_id': this.tableNewFlag ? null : this.resource.codes[this.tableIndex]._id,
                'name': event.name,
                'version': event.version,
                'date': event.date,
                'description': event.description,
                'git': event.link, // FIX
                'files': event.files};

        if (this.tableNewFlag) {
          this.resource.codes.push(code)
          loc = this.resource.codes.length - 1;
        } else {
          this.resource.codes[this.tableIndex] = code;
        }
        break;
      }
      case 2: {
        cad = {'_id': this.tableNewFlag ? null : this.resource.cads[this.tableIndex]._id,
               'name': event.name,
               'version': event.version,
               'date': event.date,
               'description': event.description,
               'files': event.files};

        if (this.tableNewFlag) {
          this.resource.cads.push(cad);
          loc = this.resource.cads.length - 1;
        } else {
          this.resource.cads[this.tableIndex] = cad;
        }
        break;
      }
      case 3: {
        inventory = {'_id': this.tableNewFlag ? null : this.resource.inventories[this.tableIndex]._id,
                     'pic': event.pic,
                     'name': event.name,
                     'description': event.description,
                     'vendor': event.vendor,
                     'model': event.model,
                     'price': event.price,
                     'quantity': event.quantity,
                     'link': event.link,
                     'files': event.files};

        if (this.tableNewFlag) {
          this.resource.inventories.push(inventory);
          loc = this.resource.inventories.length - 1;
        } else {
          this.resource.inventories[this.tableIndex] = inventory;
        }
        break;
      }
      case 4: {
        equipment = {'_id': this.tableNewFlag ? null : this.resource.equipments[this.tableIndex]._id,
                     'pic': event.pic,
                     'name': event.name,
                     'description': event.description,
                     'manufacturer': event.vendor,
                     'model': event.model,
                     'link': event.link,
                     'price': event.price,
                     'files': event.files};

        if (this.tableNewFlag) {
          this.resource.equipments.push(equipment);
          loc = this.resource.equipments.length - 1;
        } else {
          this.resource.equipments[this.tableIndex] = equipment;
        }
        break;
      }
    }

    if (this.tableNewFlag == true) {
      this.streamTable[this.tableBuildMode][loc] = 3;
      this.itemFocus = loc;

      const data = await this.resourceService.table(this.tableBuildMode, 0, this.projId, manual, code, cad, inventory, equipment);

      switch (this.tableBuildMode) {
        case 0: this.resource.manuals[loc]._id = data; break;
        case 1: this.resource.codes[loc]._id = data; break;
        case 2: this.resource.cads[loc]._id = data; break;
        case 3: this.resource.inventories[loc]._id = data; break;
        case 4: this.resource.equipments[loc]._id = data; break;
      }

      this.streamTable[this.tableBuildMode][loc] = 1;

    } else {

      this.streamTable[this.tableBuildMode][this.tableIndex] = 3;

      await this.resourceService.table(this.tableBuildMode, 1, this.projId, manual, code, cad, inventory, equipment);

      this.streamTable[this.tableBuildMode][this.tableIndex] = 1;

    }

  }

  async tableDelete(i: number, modeNum: number) {
    this.itemFocus = null;
    let _id: string

    switch (modeNum) {
       case 0: _id = this.resource.manuals[i]._id; break;
       case 1: _id = this.resource.codes[i]._id; break;
       case 2: _id = this.resource.cads[i]._id; break;
       case 3: _id = this.resource.inventories[i]._id; break;
       case 4: _id = this.resource.equipments[i]._id; break;
    }
    this.streamTable[modeNum][i] = 3;

    await this.resourceService.deleteTable(modeNum, this.projId, _id);

    switch (modeNum) {
       case 0: this.resource.manuals.splice(i, 1); break;
       case 1: this.resource.codes.splice(i, 1); break;
       case 2: this.resource.cads.splice(i, 1); break;
       case 3: this.resource.inventories.splice(i, 1); break;
       case 4: this.resource.equipments.splice(i, 1); break;
    }

    this.streamTable[modeNum][i] = 0;

  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async resourceFollow() {
    const itemId: string = this.resource._id;
    const toFollow: boolean = !this.resource.followStatus;
    this.streamFollow = 3;
    await this.peopleService.toggleFollow(1, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "resource");
    this.streamFollow = 0;
    this.resource.followStatus = toFollow;
  }

  async resourceHold() {
    this.streamHold = 3;
    this.resource.mode = (this.resource.mode==1) ? 0 : 1;
    await this.resourceService.postResource(this.projId, this.parentId, this.resource.mode);
    this.streamHold = 0;
  }

  async resourceCancel() {
    this.streamHold = 3;
    await this.resourceService.postResource(this.projId, this.parentId, 2);
    this.streamHold = 0;
    this.toggleCancel.nativeElement.click();
    this._router.navigate(['..'], { relativeTo: this.route });
  }

  async resourceFinalize() {
    this.streamFinalize = 3;
    await this.resourceService.postResource(this.projId, this.parentId, 1);
    this.streamFinalize = 0;
  }

  async resourceDelete() {
    this.streamDelete = 3;
    await this.resourceService.deleteResource(this.projId, null, this.parentId, 0);
    this.streamDelete = 0;
    this.toggleCancel.nativeElement.click();
    this._router.navigate(['..'], { relativeTo: this.route });
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  tableStreamFunc(modeNum: number) {
    let loc: number

    if (this.tableNewFlag) {
      switch (this.tableBuildMode) {
        case 0: loc = this.resource.manuals.length - 1; break;
        case 1: loc = this.resource.codes.length - 1; break;
        case 2: loc = this.resource.cads.length - 1; break;
        case 3: loc = this.resource.inventories.length - 1; break;
        case 4: loc = this.resource.equipments.length - 1; break;
      }
    } else {
      loc = this.tableIndex;
    }

    this.streamTable[this.tableBuildMode][loc] = 0;
  }

  pdfSlide(event) {
    this.pdfSlideFlag = event.flag;
    this.pdfTitle = event.title;
    this.pdfFileName = event.fileName;
  }

  animationDone(j: number): void {
    if (j <= 1) {
      this.streamMini[j] = 0;
    } else if (j == 2) {
      this.streamTags = 0;
    } else if (j == 3) {
      this.streamTitle = 0;
    }
  }

}
