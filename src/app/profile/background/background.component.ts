import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';

import {Profile, People, PeopleService} from '../../shared/services/people-service';
import {CreateMember, UpdatePosition, Position, Education, Job, Honor, Outreach, Service, Society, Language} from '../../shared/services/people-service';
import {News, NewsService} from '../../shared/services/news-service';
import {Folder, Publication, PublicationService} from '../../shared/services/publication-service';

import {Period, Quote, objectMini, groupComplex, SharedService} from '../../shared/services/shared-service';

import {MissionService} from '../services/mission-service';

import {UserService} from '../../user/services/user-service';

// import {SebmGoogleMap, SebmGoogleMapMarker, SebmGoogleMapInfoWindow} from 'angular2-google-maps/core';
// import {SebmGooglePolyline, SebmGooglePolylinePoint} from 'angular2-google-maps/core';

@Component({
  selector: 'profile-background',
  templateUrl: 'background.html',
  styleUrls: ['background.css']
})
export class BackgroundComponent {
  projId: string;
  sourceType = 1; // 0 - group, 1 - wall

  profile: Profile;

  shortBackground: string;

  companies: Position[];
  positions: Position[];
  educations: Education[];
  newses: News[] = [];

  positionBuild: Position;
  educationBuild: Education;
  modalBuildMode: boolean;

  pdfSlideFlag: boolean = false;
  fileTitle: string;
  fileName: string;

  // coverPicBuildFlag: boolean = false;
  profilePicBuildFlag: boolean = false;
  quoteBuildFlag: boolean = false;
  backgroundBuildFlag: boolean = false;
  researchInterestsBuildFlag: boolean = false;
  recreationalInterestsBuildFlag: boolean = false;

  tableIndex: number;
  tableMode: number;
  tableNewFlag: boolean = false;
  tableBuildFlag: boolean = false;
  tableHeadline: string;

  streamRetrieved: boolean[] = [];
  tableToggle: boolean;

  streamCoverPic = 0;
  streamProfilePic = 0;
  streamQuote = 0;
  streamBackground = 0;
  streamInfo = 0;
  streamTags: number[] = [0, 0];
  streamTable: number[][];

  itemFocus: number;

  meetClipConvert: string;

  publications: Publication[];
  readings: Publication[];

  streamPublications: number[];
  streamPublicationsFolder: number[];

  streamReadings: number[];
  streamReadingsFolder: number[];

  currentFolder: Folder;

  fragment: string;

  action: string;

  yearUniqs = {
    "2012": 3,
    "2013": 1,
    "2014": 3,
    "2015": 5,
    "2016": 3,
    "2017": 4,
    "2018": 2,
    "2019": 1
  }

  @ViewChild('scrollInterests', { static: false }) private scrollInterests: ElementRef;
  @ViewChild('scrollAbout', { static: false }) private scrollAbout: ElementRef;
  @ViewChild('scrollPositions', { static: false }) private scrollPositions: ElementRef;

  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;
  @ViewChild('toggleLabBuildModal', { static: true }) toggleLabBuild: ElementRef;

  constructor(private titleService: Title,
              private peopleService: PeopleService,
              private newsService: NewsService,
              private publicationService: PublicationService,
              private sharedService: SharedService,
              public userService: UserService,
              public missionService: MissionService,
              private route: ActivatedRoute,
              private _router: Router) {}

  async ngOnInit() {
    this.profile = null;
    this.projId = this.missionService.peopleId;
    this.streamRetrieved = [false, false, false, false, false, false, false, false];
    this.titleService.setTitle(this.missionService.peopleName + ' | Academig');

    this.updatePublications();
    this.updateReadings();
    this.updatePage();

    if (this.missionService.peopleId!="academig") this.updateNews();

    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "about": this.scrollAbout.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
           case "interests": this.scrollInterests.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
           case "positions": this.scrollPositions.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
        // document.querySelector('#' + this.fragment).scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (e) { }
    }, 1000);
  }

  scrollFullBackground() {
    this.scrollAbout.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async updatePage() {
    this.profile = await this.peopleService.getProfileBackground(this.projId);

    let m;
    const regex = /^.*?[\.!\?](?:\s|$)/;
    if ((m = regex.exec(this.profile.background))!==null) {
      // https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags
      // https://stackoverflow.com/questions/5002111/how-to-strip-html-tags-from-string-in-javascript
      this.shortBackground = m[0].replace(/<\/?[^>]+(>|$)/g, "");
    }

    this.positions = this.profile.positions.filter(x => x.group.university.name!="company" && x.titles[0]<300);
    this.educations = this.profile.positions.filter(x => x.group.university.name!="company" && x.titles[0]>=300);
    this.companies = this.profile.positions.filter(x => x.group.university.name=="company");

    this.meetClipConvert = this.profile.meetClip ? this.sharedService.convertMedia(this.profile.meetClip) : null;

    this.streamTable = [(new Array(this.positions.length).fill(0))];
    this.streamTable.push(new Array(this.educations.length).fill(0));
    this.streamTable.push(new Array(this.profile.honors.length).fill(0));
    this.streamTable.push(new Array(this.companies.length).fill(0));
    this.streamTable.push(new Array(this.profile.outreach.length).fill(0));
    this.streamTable.push(new Array(null).fill(0));
    this.streamTable.push(new Array(this.profile.services.length).fill(0));
    this.streamTable.push(new Array(this.profile.societies.length).fill(0));
    this.streamTable.push(new Array(this.profile.languages.length).fill(0));

    if (this.profile.folders) {
      if (this.profile.folders.findIndex(r=>r.folder=="current")==-1) this.profile.folders.unshift({"_id": null, "folder": 'current', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null})
      if (this.profile.folders.findIndex(r=>r.folder=="want")==-1) this.profile.folders.unshift({"_id": null, "folder": 'want', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null})
      if (this.profile.folders.findIndex(r=>r.folder=="read")==-1) this.profile.folders.unshift({"_id": null, "folder": 'read', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null})
      this.currentFolder = this.profile.folders.find(r=>r.folder=="current");
    } else {
      this.profile.folders = [
        {"_id": null, "folder": 'current', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null},
        {"_id": null, "folder": 'want', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null},
        {"_id": null, "folder": 'read', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null}
      ]
    }

    if (this.missionService.meFlag) {
      this.positionBuild = this.positions.filter(r => r.status>8)[0];
      this.educationBuild = this.educations.filter(r => r.status>8)[0];

      const that = this;

      if (this.positionBuild || this.educationBuild) {
        setTimeout(function() {
          that.modalBuildMode = (that.positionBuild) ? false : true;
          that.toggleLabBuild.nativeElement.click();
        }, 5000);
      }
    }

    this.streamRetrieved[0] = true;
  }

  async updateNews() {
    const news = await this.newsService.getNews(106, 0, this.missionService.peopleId);
    if (news) {
      this.newses = news;
      this.streamRetrieved[5] = true;
    }
  }

  async updatePublications() {
    const publications = await this.publicationService.getPublications(8, this.projId, 0);

    const yearArrays = publications.map(r => (new Date(r.date)).getFullYear());
    const yearFlatten = [].concat(...yearArrays);
    this.yearUniqs = yearFlatten.reduce((acc, val) => {
      acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
      return acc;
    }, {});

    this.publications = publications.slice(0,2);

    this.streamPublications = new Array(this.publications.length).fill(0);
    this.streamPublicationsFolder = new Array(this.publications.length).fill(0);
    this.streamRetrieved[6] = true;
  }

  async updateReadings() {
    this.readings = await this.publicationService.getPublications(0, this.projId, 0);
    this.streamRetrieved[7] = true;
    this.streamReadings = new Array(this.readings.length).fill(0);
    this.streamReadingsFolder = new Array(this.readings.length).fill(0);
  }

  async publicationFolder(event) {
    // event: 0: ID, 1: index, 2: Folder
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

    if (this.userService.userId) {
      const stickFlag: boolean = folder.folder=="want" || folder.folder=="read" || folder.folder=="current";
      this.streamPublicationsFolder[event[1]] = 3;
      await this.peopleService.toggleFolder(event[0], folder, event[2].checked);
      if (!stickFlag && event[2].checked) this.userService.toggleFolder(folder.folder);
      if (this.publications[event[1]].folders) {
        if (stickFlag) this.publications[event[1]].folders = this.publications[event[1]].folders.filter(r => (r.folder!="want" && r.folder!="read" && r.folder!="current"));
        this.publications[event[1]].folders.push(folder);
      } else {
        this.publications[event[1]].folders=[folder];
      }
      this.streamPublicationsFolder[event[1]] = 0;
    } else {
      this.action = "reading library";
      this.toggleSignUp.nativeElement.click();
    }
  }

  async readingsFolder(event) {
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

    if (this.userService.userId) {
      const stickFlag: boolean = folder.folder=="want" || folder.folder=="read" || folder.folder=="current";
      this.streamReadingsFolder[event[1]] = 3;
      await this.peopleService.toggleFolder(event[0], folder, event[2].checked);
      if (event[2].checked) this.userService.toggleFolder(folder.folder);
      if (this.readings[event[1]].folders) {
        if (stickFlag) this.readings[event[1]].folders = this.readings[event[1]].folders.filter(r => (r.folder!="want" && r.folder!="read" && r.folder!="current"));
        this.readings[event[1]].folders.push(folder);
      } else {
        this.readings[event[1]].folders=[folder];
      }
      this.streamReadingsFolder[event[1]] = 0;
    } else {
      this.action = "reading library";
      this.toggleSignUp.nativeElement.click();
    }
  }

  pdfSlide(flag: boolean, event) {
    this.pdfSlideFlag = flag;
    if (flag == true) {
      this.fileTitle = event.title;
      this.fileName = event.fileName;
    }
  }

  buildLabProfilePopupFunc(event) {
    this.toggleLabBuild.nativeElement.click();
    this.buildLabProfileFunc(event)
  }

  buildLabProfileFunc(event) {
    this.userService.buildPositionWebsiteFlag = true;
    var i: number;

    if (event.mode==0) {
      i = this.positions.findIndex(x => x._id == event._id);
      this.userService.buildPositionWebsite = {
        group: this.positions[i].group,
        period: this.positions[i].period,
        titles: this.positions[i].titles,
      };
    } else if (event.mode==1) {
      i = this.educations.findIndex(x => x._id == event._id);
      this.userService.buildPositionWebsite = {
        group: this.educations[i].group,
        period: this.educations[i].period,
        titles: this.educations[i].titles,
      };
    } else if (event.mode==2) {
      i = this.companies.findIndex(x => x._id == event._id);
      this.userService.buildPositionWebsite = {
        group: this.companies[i].group,
        period: this.companies[i].period,
        titles: this.companies[i].titles,
      };
    }
    this._router.navigate(['/build']);
  }

  // async coverPicOp(mode: number, flag: boolean, file: string) {
  //   this.coverPicBuildFlag = flag;
  //
  //   if (mode == 1) {
  //
  //     this.streamCoverPic = 3;
  //
  //     await this.sharedService.deletePic(2, this.projId);
  //
  //     this.profile.coverPic = null,
  //     this.streamCoverPic = 0,
  //     this.userService.userProgress[4] = false;
  //
  //   } else if (mode == 2) {
  //
  //     this.profile.coverPic = file;
  //     this.userService.userCoverPic = file;
  //     this.streamCoverPic = 3;
  //
  //     await this.sharedService.postPic(2, this.projId, [file]);
  //
  //     this.streamCoverPic = 0,
  //     this.userService.userProgress[4] = true;
  //
  //   } else if (mode == 3) {
  //
  //     this.streamCoverPic = 0;
  //
  //   }
  //
  // }

  async profilePicOp(mode: number, flag: boolean, event) {
    this.profilePicBuildFlag = flag;
    if (mode == 1) {

      this.streamProfilePic = 3;

      await this.sharedService.deletePic(0, this.projId);

      this.profile.pic = null,
      this.streamProfilePic = 0,
      this.userService.userProgress[0] = false;

    } else if (mode == 2) {

      this.profile.pic = event;
      this.userService.userPic = event;
      this.missionService.peoplePic = event;
      this.streamProfilePic = 3;

      await this.sharedService.postPic(0, this.projId, [event]);

      this.streamProfilePic = 1,
      this.userService.userProgress[0] = true;

    } else if (mode == 3) {

      this.streamProfilePic = 0;

    }
  }

  async quoteOp(mode: number, flag: boolean, event) {
    this.quoteBuildFlag = flag;

    if (mode == 1) {

      this.streamQuote = 3;
      await this.sharedService.deleteQuote(this.projId, 1);
      this.profile.quote.text = null,
      this.profile.quote.name = null,
      this.profile.quote.pic = null,
      this.streamQuote = 0;

    } else if (mode == 2) {

      const quote: Quote = {
        'text': event.text,
        'name': event.name,
        'pic': event.pic,
      };
      this.profile.quote = quote
      this.streamQuote = 3;
      await this.sharedService.postQuote(quote, this.projId, 1);
      this.streamQuote = 1;

    } else if (mode == 3) {

      this.streamQuote = 0;

    }

  }

  async backgroundOp(mode: number, flag: boolean, event) {
    this.backgroundBuildFlag = flag;
    if (mode == 1) {

      this.streamBackground = 3;

      await this.sharedService.deleteTextPic(1, this.projId, null);

      this.profile.background = null;
      this.profile.meetClip = null;
      this.streamBackground = 0;
      this.userService.userProgress[2] = false;

    } else if (mode == 2) {

      let m;
      const regex = /^.*?[\.!\?](?:\s|$)/;
      this.profile.background = event.text
      if ((m = regex.exec(this.profile.background))!==null) {
        this.shortBackground = m[0];
      }

      this.profile.background = event.text;
      this.profile.meetClip = event.clip;
      this.streamBackground = 3;
      if (event.clip) this.meetClipConvert = this.sharedService.convertMedia(event.clip);

      await this.sharedService.postTextPic(1, this.projId, null, event.text, event.clip, null);

      this.streamBackground = 1;
      this.userService.userProgress[2] = true;

    } else if (mode == 3) {

      this.streamBackground = 0;

    }
  }

  async tagsOp(type: number, mode: number, flag: boolean, event) {
    if (type == 0) {
      this.researchInterestsBuildFlag = flag;
    } else {
      this.recreationalInterestsBuildFlag = flag;
    }

    if (mode == 1) {

      this.streamTags[type] = 3;

      await this.sharedService.deleteTags(type + 1, this.projId, this.projId);

      if (type == 0) {
        this.profile.researchInterests = [];
      } else {
        this.profile.recreationalInterests = [];
      }

      this.streamTags[type] = 0;
      this.userService.userProgress[1] = false;

    } else if (mode == 2) {

      if (type == 0) {
        this.profile.researchInterests = event;
      } else {
        this.profile.recreationalInterests = event;
      }

      this.streamTags[type] = 3;

      await this.sharedService.postTags(type + 1, type ? this.profile.recreationalInterests : this.profile.researchInterests, this.projId, this.projId);

      this.streamTags[type] = 1;
      this.userService.userProgress[1] = true;

    } else if (mode == 3) {

      this.streamTags[type] = 0;

    }

  }

  tagClickOp(i: number) {
    this.userService.searchText = this.profile.researchInterests[i];
    this._router.navigate(['./search']);
  }

  tableSlide(mode: number, flag: boolean, event) {
    this.tableMode = mode;
    this.tableNewFlag = true;
    this.tableBuildFlag = flag;
    this.tableHeadline = event.headline;
  }

  tableEdit(mode: number, flag: boolean, event) {
    this.tableMode = mode;
    this.tableNewFlag = false;
    this.tableBuildFlag = flag;
    this.tableHeadline = event.headline;

    switch (mode) {
       case 0: this.tableIndex = this.positions.findIndex(x => x._id == event._id); break;
       case 1: this.tableIndex = this.educations.findIndex(x => x._id == event._id); break;
       case 2: this.tableIndex = this.profile.honors.findIndex(x => x._id == event._id); break;
       case 3: this.tableIndex = this.companies.findIndex(x => x._id == event._id); break;
       case 4: this.tableIndex = this.profile.outreach.findIndex(x => x._id == event._id); break;
       // case 5: this.tableIndex = this.profile.teachings.findIndex(x => x._id == event._id); break;
       case 6: this.tableIndex = this.profile.services.findIndex(x => x._id == event._id); break;
       case 7: this.tableIndex = event.index; break;
       case 8: this.tableIndex = event.index; break;
    }
  }

  async tableUpdate(event) {
    let createMember: CreateMember;
    let updatePosition: UpdatePosition;

    let position: Position;
    let education: Education;

    let job: Job;
    let honor: Honor;
    let outreach: Outreach;
    let service: Service;
    let society: Society;
    let language: Language;

    let loc: number;

    let userGroupStatus: number;
    let userGroupFlag: boolean;

    let group: groupComplex;
    let period: Period;

    if (this.tableMode<7) {
      period = {
        'start': event.start,
        'end': event.single[0] ? null : event.end,
        'mode': event.single[0] ? 2 : (event.present[0] ? 1 : 0)
      }
    }

    if (this.tableMode<=1 || this.tableMode==3) {

      var bachelorFlag: boolean = event.titles==400 || event.titles==401 || event.titles==402 || event.titles==302;

      // console.log('event',event)

      if (this.tableNewFlag) {
        group = {'group': (!bachelorFlag && event.group._id) ? event.group : {"_id": null, "name": event.group, "pic": null, "link": null},
                 'department': event.department._id ? event.department : {"_id": null, "name": event.department, "pic": null, "link": event.department.replace(/ /g,"_").toLowerCase()},
                 'university': event.university.link ? event.university : {"_id": null, "name": event.university.name, "pic": null, "link": event.university.name.replace(/ /g,"_").toLowerCase()}
                };

        userGroupFlag = !bachelorFlag ? this.userService.userPositions.filter(r => r.group.group._id==event.group._id).length>0 : false;

        userGroupStatus = group.group._id ? ((period.mode == 1) ? 2 : 4) : ((period.mode == 1) ? 9 : 8);

      } else {
        if (this.tableMode==0) {
          group = this.positions[this.tableIndex].group;
          userGroupStatus = (this.positions[this.tableIndex].status>=8) ? ((period.mode == 1) ? 9 : 8) : ((period.mode == 1) ? 2 : 4);
        } else if (this.tableMode==1)  {
          group = this.educations[this.tableIndex].group;
          userGroupStatus = (this.educations[this.tableIndex].status>=8) ? ((period.mode == 1) ? 9 : 8) : ((period.mode == 1) ? 2 : 4);
        } else if (this.tableMode==3)  {
          group = this.companies[this.tableIndex].group;
          userGroupStatus = (this.companies[this.tableIndex].status>=8) ? ((period.mode == 1) ? 9 : 8) : ((period.mode == 1) ? 2 : 4);
        }
      }
    }

    switch (this.tableMode) {
       case 0: // Positions
       case 3: // Companies
       {
         position = {'_id': this.tableNewFlag ? null : ((this.tableMode==0) ? this.positions[this.tableIndex]._id : this.companies[this.tableIndex]._id),
                     'status': userGroupStatus,
                     'mode': userGroupFlag ? 2 : 4,
                     'period': period,
                     'titles': [event.titles],
                     'stage': 2,
                     'group': group,
                     'text': ''
                    };

         if (this.tableNewFlag) {
           createMember = ({'_id': this.projId,
                            'name': '0',
                            'pic': '0',
                            'email': '0',
                            'status': userGroupStatus,
                            'mode': userGroupFlag ? 2 : 4,
                            'period': period,
                            'titles': [event.titles],
                            'group': group,
                            'groupId': group.group._id ?  group.group._id : null,
                            'text': '',
                            'degree': null,
                            'ai': null
                          });

           if (this.tableMode==0) {
             this.positions.push(position);
             loc = this.positions.length - 1;
           } else {
             this.companies.push(position);
             loc = this.companies.length - 1;
           }

           // if (userGroupFlag && group.group._id && (createMember.status>=4 && createMember.status<=9)) {
           // if (!bachelorFlag && (userGroupStatus>=4 && userGroupStatus<=9)) {
           if (userGroupStatus>=4 && userGroupStatus<=9) {
             this.userService.userPositions.push({
                                                 'coverPic': null,
                                                 'status': position.status,
                                                 'mode': position.mode,
                                                 'group': position.group,
                                                 'period': position.period,
                                                 'titles': position.titles,
                                                 'email': {'address': null,
                                                           'updated': null,
                                                           'stage': 2},
                                                 'contest': null
                                                });
           }

         } else {
           updatePosition = ({'_id': this.projId,
                              'positionId': (this.tableMode==0) ? this.positions[this.tableIndex]._id : this.companies[this.tableIndex]._id,
                              'titles': [event.titles],
                              'index': 0,
                              'oldCategory': null,
                              'newCategory': null,
                              'period': period,
                              'degree': null
                            })

           if (this.tableMode==0) {
             this.positions[this.tableIndex] = position;
           } else {
             this.companies[this.tableIndex] = position;
           }

         };
         break;
       }

       case 1: { // Degree
         education = {'_id': this.tableNewFlag ? null : this.educations[this.tableIndex]._id,
                     'status': userGroupStatus,
                     'mode': userGroupFlag ? 2 : 4,
                     'period': period,
                     'titles': [event.titles],
                     'stage': 2,
                     'group': group,
                     'text': '',
                     'degree': (period.mode==1) ?
                               {
                                'field': event.field,
                                'honor': null,
                                'thesis': null,
                                'grade': null,
                                'file': null
                               } : {
                                'field': event.field,
                                'honor': event.honor,
                                'thesis': event.thesisTitle,
                                'grade': event.thesisGrade,
                                'file': event.thesisFile
                               }
                    };

         if (this.tableNewFlag) {
           createMember = ({'_id': this.projId,
                            'name': '0',
                            'pic': '0',
                            'email': '0',
                            'status': userGroupStatus,
                            'mode': userGroupFlag ? 2 : 4,
                            'period': period,
                            'titles': [event.titles],
                            'group': group,
                            'groupId': group.group._id ? group.group._id : null,
                            'text': '',
                            'degree': {
                                       'field': event.field,
                                       'honor': event.honor,
                                       'thesis': event.thesisTitle,
                                       'grade': event.thesisGrade,
                                       'file': event.thesisFile
                                     },
                            'ai': null
                          });

           this.educations.push(education);
           loc = this.educations.length - 1;
           // if (userGroupFlag && group.group._id && (createMember.status>=4 && createMember.status<=9)) {
           if (!bachelorFlag && (userGroupStatus>=4 && userGroupStatus<=9)) {
             this.userService.userPositions.push({
                                                  'coverPic': null,
                                                  'status': education.status,
                                                  'mode': education.mode,
                                                  'group': education.group,
                                                  'titles': education.titles,
                                                  'period': education.period,
                                                  'email': {'address': null,
                                                            'updated': null,
                                                            'stage': 2
                                                          },
                                                  'contest': null
                                                 });
            }

         } else {
           updatePosition = ({'_id': this.projId,
                              'positionId': this.educations[this.tableIndex]._id,
                              'titles': [event.titles],
                              'index': 0,
                              'oldCategory': null,
                              'newCategory': null,
                              'period': period,
                              'degree': {
                                         'field': event.field,
                                         'honor': event.honor,
                                         'thesis': event.thesisTitle,
                                         'grade': event.thesisGrade,
                                         'file': event.thesisFile
                                        }
                            })

           this.educations[this.tableIndex] = education;
         };
         break;
       }

       case 2: { // Honors
         honor = {'_id': this.tableNewFlag ? null : this.profile.honors[this.tableIndex]._id,
                  'period': period,
                  'name': event.name};

         if (this.tableNewFlag) {
           this.profile.honors.push(honor);
           loc = this.profile.honors.length - 1;
         } else {
           this.profile.honors[this.tableIndex] = honor;
         }
         break;
       }

       case 4: { // Outreach
         outreach = {'_id': this.tableNewFlag ? null : this.profile.outreach[this.tableIndex]._id,
                     'period': period,
                     'name': event.name,
                     'role': event.role};

         if (this.tableNewFlag) {
           this.profile.outreach.push(outreach);
           loc = this.profile.outreach.length - 1;
         } else {
           this.profile.outreach[this.tableIndex] = outreach;
         }
         break;
       }

       case 6: { // Services
         service = {'_id': this.tableNewFlag ? null : this.profile.services[this.tableIndex]._id,
                    'period': period,
                    'journal': event.journal,
                    'role': event.role};
                    // 'journal': event.journal.name ? event.journal : {name: event.journal, issn: []},

         if (this.tableNewFlag) {
           this.profile.services.push(service);
           loc = this.profile.services.length - 1;
         } else {
           this.profile.services[this.tableIndex] = service;
         }
         break;
       }

       case 7: { // Societies
         society = {'_id': this.tableNewFlag ? null : this.profile.societies[this.tableIndex]._id,
                    'name': event.name};

         if (this.tableNewFlag) {
           this.profile.societies.push(society);
           loc = this.profile.societies.length - 1;
         } else {
           this.profile.societies[this.tableIndex] = society;
         }
         break;
       }

       case 8: { // Languages
         language = {'_id': this.tableNewFlag ? null : this.profile.languages[this.tableIndex]._id,
                     'name': event.language.name,
                     'level': event.level};

         if (this.tableNewFlag) {
           this.profile.languages.push(language);
           loc = this.profile.languages.length - 1;
         } else {
           this.profile.languages[this.tableIndex] = language;
         }
         break;
       }
    }

    this.tableToggle = !this.tableToggle;
    this.tableBuildFlag = false;

    if (this.tableNewFlag == true) {
      this.streamTable[this.tableMode][loc] = 3;
      this.itemFocus = loc;

      if (this.tableMode<=1 || this.tableMode==3) {

        const item = await this.peopleService.putMember(createMember, group ? group.group._id : null, 0); // position, degree

        switch (this.tableMode) {
           case 0: {
             this.positions[loc].group = item.group;
             this.positions[loc]._id = item.group._id;
             break;
           }
           case 1: {
             this.educations[loc].group = item.group;
             this.educations[loc]._id = item._id;
             break;
           }
           case 3: {
             this.companies[loc].group = item.group;
             this.companies[loc]._id = item._id;
             break;
           }
        }

        this.streamTable[this.tableMode][loc] = 1;
        this.userService.userProgress[3] = true;

      } else {

        const data = await this.peopleService.putTable(this.tableMode, this.projId, position, education, honor, job, outreach, null, service, society, language, null);

        switch (this.tableMode) {
          case 2: this.profile.honors[loc]._id = data; break;
          case 4: this.profile.outreach[loc]._id = data; break;
          case 6: this.profile.services[loc]._id = data; break;
          case 7: this.profile.societies[loc]._id = data; break;
          case 8: this.profile.languages[loc]._id = data; break;
        }

        this.streamTable[this.tableMode][loc] = 1;

      };

    } else {

      this.streamTable[this.tableMode][this.tableIndex] = 3;

      if (this.tableMode<=1 || this.tableMode==3) {

        await this.peopleService.postPosition(updatePosition, null, -1); // position, degree

        this.streamTable[this.tableMode][this.tableIndex] = 1;

      } else {

        await this.peopleService.postTable(this.tableMode, this.projId, position, education, honor, job, outreach, null, service, society, language, null);

        this.streamTable[this.tableMode][this.tableIndex] = 1;

      };

    }

  }

  tableCancel() {
    this.tableBuildFlag = false;
  }

  async tableDelete(event, modeNum: number) {
    this.itemFocus = null;
    let i: number;
    let _id: string = event._id;
    let groupId: string
    let iSort: number = event.index;

    switch (modeNum) {
       case 0: {
         i = this.positions.findIndex(x => x._id == _id);
         groupId = this.positions[i].group.group._id;
         break;
       }
       case 1: {
         i = this.educations.findIndex(x => x._id == _id);
         groupId = this.educations[i].group.group._id;
         break;
       }
       case 2: i = this.profile.honors.findIndex(x => x._id == event._id); break;
       case 3: {
         i = this.companies.findIndex(x => x._id == _id);
         groupId = this.companies[i].group.group._id;
         break;
       }
       case 4: i = this.profile.outreach.findIndex(x => x._id == _id); break;
       case 6: i = this.profile.services.findIndex(x => x._id == _id); break;
       case 7: i = parseInt(_id); break;
       case 8: i = this.profile.languages.findIndex(x => x._id == _id); break;
    }

    this.streamTable[modeNum][iSort] = 3;

    if (modeNum<=1 || modeNum==3) {

      await this.peopleService.moveMember(this.projId, 0, null, groupId, 0, 3, 1, null);

      switch(modeNum) {
        case 0: this.positions.splice(i, 1); break;
        case 1: this.educations.splice(i, 1); break;
        case 3: this.companies.splice(i, 1); break;
      }

      this.userService.userPositions = this.userService.userPositions.filter(r => r.group.group._id!=groupId);
      this.streamTable[modeNum][iSort]=0;
      this.tableToggle=!this.tableToggle;

      if (this.positions.length==0 && this.educations.length==0) this.userService.userProgress[2] = false;

    } else {

      await this.peopleService.deleteTable(modeNum, _id);

      switch (modeNum) {
         case 2: this.profile.honors.splice(i, 1); break;
         case 4: this.profile.outreach.splice(i, 1); break;
         case 6: this.profile.services.splice(i, 1); break;
         case 7: this.profile.societies.splice(i, 1); break;
         case 8: this.profile.languages.splice(i, 1); break;
      }

      this.streamTable[modeNum][iSort] = 0;
      this.tableToggle = !this.tableToggle;

    }
  }

  streamFunc(modeNum: number) {
    let loc: number

    if (this.tableNewFlag) {
      switch (this.tableMode) {
        case 0: loc = this.positions.length - 1; break;
        case 1: loc = this.educations.length - 1; break;
        case 2: loc = this.profile.honors.length - 1; break;
        case 3: loc = this.companies.length - 1; break;
        case 4: loc = this.profile.outreach.length - 1; break;
        case 6: loc = this.profile.services.length - 1; break;
        case 7: loc = this.profile.societies.length - 1; break;
        case 8: loc = this.profile.languages.length - 1; break;
      }
    } else {
      loc = this.tableIndex;
    }

    this.streamTable[this.tableMode][loc] = 0;
  }

}
