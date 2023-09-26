import {Component, Input, OnDestroy, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, ActivatedRoute} from '@angular/router';

import {Talk, Poster, Press, MediaService} from '../../shared/services/media-service';

import {PeopleService} from '../../shared/services/people-service';

import {SharedService} from '../../shared/services/shared-service';

import {MissionService} from '../services/mission-service';

import {UserService} from '../../user/services/user-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
  selector: 'profile-media',
  templateUrl: 'media.html',
  styleUrls: ['media.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class MediaComponent {
  talks: Talk[];
  posters: Poster[];
  presses: Press[];

  streamTalk: number[];
  streamPoster: number[];
  streamPress: number[];

  activeTab: number;
  streamRetrieved: boolean[];

  mediaIndex: number;
  mediaNewFlag = false;
  mediaBuildFlag = false;

  pdfSlideFlag = false;
  fileTitle: string;
  fileName: string;

  projId: string;
  itemFocus: number;
  fragment: string;
  typeNames = ['talk', 'poster', 'press'];

  @ViewChild('scrollTalk', { static: true }) private scrollTalk: ElementRef;
  @ViewChild('scrollPoster', { static: true }) private scrollPoster: ElementRef;
  @ViewChild('scrollPress', { static: true }) private scrollPress: ElementRef;

  constructor(private titleService: Title,
              private mediaService: MediaService,
              private peopleService: PeopleService,
              private sharedService: SharedService,
              private userService: UserService,
              public missionService: MissionService,
              private route: ActivatedRoute,
              private _router: Router) {}

  ngOnInit() {
    this.projId = this.missionService.peopleId;
    this.titleService.setTitle('Media - ' + this.missionService.peopleName + ' | Academig');
    this.streamRetrieved = [false, false, false];
    this.activeTab = 0;
    this.talks = [];
    this.posters = [];
    this.presses = [];

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment
      this.scrollFunc()
    });
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
          case "poster": this.activeTab = 1; this.mediaFunc(this.activeTab); this.scrollPoster.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
          case "press": this.activeTab = 2; this.mediaFunc(this.activeTab); this.scrollPress.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
          case "talk": this.activeTab = 0; this.mediaFunc(this.activeTab); this.scrollTalk.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
          default: this.activeTab = 0; this.mediaFunc(this.activeTab); break;
        }
      } catch (e) { }
    }, 1000);
  }

  async mediaFunc(tabNum: number) {
    this.activeTab = tabNum;

    if (this.streamRetrieved[tabNum] == false) {
      const data = await this.mediaService.getMedia(1, this.projId, tabNum);

      if (tabNum == 0) {
        this.talks = data;
        this.streamTalk = new Array(this.talks.length).fill(0);
      }
      if (tabNum == 1) {
        this.posters = data;
        this.streamPoster = new Array(this.posters.length).fill(0);
      }
      if (tabNum == 2) {
        this.presses = data;
        this.streamPress = new Array(this.presses.length).fill(0);
      }

      this.streamRetrieved[tabNum] = true;
    }
  }

  mediaSlide(buildFlag: boolean, i: number, newFlag: boolean) {
    this.mediaIndex = i;
    this.mediaBuildFlag = buildFlag;
    this.mediaNewFlag = newFlag;
  }

  async mediaUpdate(event) {
    this.mediaBuildFlag = false;

    if (this.activeTab == 0) {

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

        this.talks[this.talks.length - 1]._id = await this.mediaService.putMedia(talk, null, null, this.projId, 2, 0);
        this.streamTalk[this.talks.length - 1] = 1;
        this.userService.userProgress[13] = true;

      } else {

        this.talks[this.mediaIndex] = talk;
        this.streamTalk[this.mediaIndex] = 3;

        await this.mediaService.postMedia(talk, null, null, this.projId, talk._id, 2, 0);
        this.streamTalk[this.mediaIndex] = 1;
       }

    } else if (this.activeTab == 1) {

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

       this.posters[this.posters.length - 1]._id = await this.mediaService.putMedia(null, poster, null, this.projId, 2, 1);
       this.streamPoster[this.posters.length - 1] = 1;
       this.userService.userProgress[14] = true;

      } else {

       this.posters[this.mediaIndex] = poster;
       this.streamPoster[this.mediaIndex] = 3;

       await this.mediaService.postMedia(null, poster, null, this.projId, poster._id, 2, 1);
       this.streamPoster[this.mediaIndex] = 1;

      }

    } else if (this.activeTab == 2) {

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

       this.presses[this.presses.length - 1]._id = await this.mediaService.putMedia(null, null, press, this.projId, 2, 2);
       this.streamPress[this.presses.length - 1] = 1;
       this.userService.userProgress[15] = true;

     } else {

       this.presses[this.mediaIndex] = press;
       this.streamTalk[this.mediaIndex] = 3;

       await this.mediaService.postMedia(null, null, press, this.projId, press._id, 2, 2);
       this.streamPress[this.mediaIndex] = 1;

     }
   }
  }

  async mediaDelete(i: number) {
    this.itemFocus = null;
    let _id: string

    if (this.activeTab == 0) {
      _id = this.talks[i]._id;
      this.streamTalk[i] = 3;
    } else if (this.activeTab == 1) {
      _id = this.posters[i]._id;
      this.streamPoster[i] = 3;
    } else if (this.activeTab == 2) {
      _id = this.presses[i]._id;
      this.streamPress[i] = 3;
    }

    await this.mediaService.deleteMedia(_id, this.projId, 2, this.activeTab);

    if (this.activeTab == 0) {
      this.talks.splice(i, 1);
      this.streamTalk[i] = 0;
      if (this.talks.length==0) this.userService.userProgress[13] = false;
    } else if (this.activeTab == 1) {
      this.posters.splice(i, 1);
      this.streamPoster[i] = 0;
      if (this.posters.length==0) this.userService.userProgress[14] = false;
    } else if (this.activeTab == 2) {
      this.presses.splice(i, 1);
      this.streamPress[i] = 0;
      if (this.presses.length==0) this.userService.userProgress[15] = false;
    }

  }

  mediaStreamFunc(tab: number) {
    let loc: number

    if (tab == 0) {
      loc = this.mediaNewFlag ? this.talks.length - 1 : this.mediaIndex;
      this.streamTalk[loc] = 0;
    } else if (tab == 1) {
      loc = this.mediaNewFlag ? this.posters.length - 1 : this.mediaIndex;
      this.streamPoster[loc] = 0;
    } else if (tab == 2) {
      loc = this.mediaNewFlag ? this.presses.length - 1 : this.mediaIndex;
      this.streamPress[loc] = 0;
    }

  }

  pdfSlide(flag: boolean, event) {
    this.pdfSlideFlag = flag;
    if (flag == true) {
      this.fileTitle = event.title;
      this.fileName = event.fileName;
    }
  }

}
