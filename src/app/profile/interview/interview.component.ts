import {Component, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {News, CreateNews, NewsService} from '../../shared/services/news-service';

import {Followings, PeopleService} from '../../shared/services/people-service';
import {MissionService} from '../services/mission-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
    selector: 'profile-interview',
    templateUrl: 'interview.html',
    styleUrls: ['interview.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class InterviewComponent {
  streamRetrieved: boolean;

  // newsBuildFlag = false;
  // newses: News[] = [];

  constructor(public titleService: Title,
              public peopleService: PeopleService,
              public missionService: MissionService) {
    this.titleService.setTitle('Interview - ' + this.missionService.peopleName + ' | Academig');
    this.getInterview();
  }

  getInterview() {
    this.streamRetrieved = false;
    // this.subscription = this.peopleService.getFollowings().subscribe(
  }

  requestInterview() {
    this.streamRetrieved = false;
    // this.subscription = this.newsService.getInterview(6, this.offset, this.missionService.peopleId).subscribe(
  }

  // newsSlide(flag: boolean, i: number, newFlag: boolean) {
  //   this.newsBuildFlag = flag;
  // }
}
