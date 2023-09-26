import {Component, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {News, CreateNews, PostNews, NewsService} from '../../shared/services/news-service';

import {Followings, PeopleService} from '../../shared/services/people-service';
import {MissionService} from '../services/mission-service';
import {UserService} from '../../user/services/user-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
    selector: 'group-news',
    templateUrl: 'news.html',
    styleUrls: ['news.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class GroupNewsComponent {
  streamRetrieved: boolean;
  streamNews: number = 0;

  newsBuildFlag: boolean = false;
  newsNewFlag: boolean = false;
  newsIndex: number;

  newses: News[] = [];

  offset = 0;
  id: string;

  followings: Followings;

  fragment: string;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor(public route: ActivatedRoute,
              public titleService: Title,
              public newsService: NewsService,
              public peopleService: PeopleService,
              public missionService: MissionService,
              public userService: UserService) {
    this.titleService.setTitle('Lab News - ' + this.missionService.groupTitle + ' | Academig');
    if (this.missionService.isAuthenticated) {
      this.getFollowings();
    } else {
      this.updateNews();
    }

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment
      this.scrollFunc()
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

  loadMore() {
    this.streamRetrieved = false;
    this.offset += 10;
    this.updateNews();
  }

  async getFollowings() {
    const followings = await this.peopleService.getFollowings();

    if (followings) {
      this.streamRetrieved = false;
      this.followings = followings;
      this.updateNews();
    }
  }
  // err => console.log('Can\'t get User Followings. Error code: %s, URL: %s ', err.status, err.url),

  async updateNews() {
    const news = await this.newsService.getNews(2, this.offset, this.missionService.groupId);

    if (news) {
      this.newses.push.apply(this.newses, news);
      this.streamRetrieved = true;
    }
  }

  newsSlide(flag: boolean, i: number, newFlag: boolean) {
    this.newsIndex = i;
    this.newsBuildFlag = flag;
    this.newsNewFlag = newFlag;
  }

  async newsUpdate(event) {
    this.newsBuildFlag = false;

    let createNews: CreateNews;
    let postNews: PostNews;

    if (this.newsNewFlag == true) {

      createNews = {
                    'actorId': this.userService.userId,
                    'verb': 20000,
                    'objectId': null,
                    'text': event.text,
                    'pic': event.pic,
                    'ai': null
                    // 'ai': event.intelligence ? event.intelligence[0] : null
                   };

    } else {

      postNews = {
                  '_id': this.newses[this.newsIndex].id,
                  'text': event.text,
                  'pic': event.pic
                 }

    }

    if (this.newsNewFlag == true) {

      const news: News = {
                          'id': null,
                          'actor': {'_id': this.userService.userId, 'name': this.userService.userName, 'pic': this.userService.userPic},
                          'verb': 20000,
                          'object': {'_id': null, 'name': 'groupNews', 'pic': null},
                          'target': this.missionService.groupIndex,
                          'time': new Date(),
                          'text': event.text,
                          'link': null,
                          'pic': event.pic,
                          'own_reactions': {claps: null,
                                            comments: null},
                          'latest_reactions': {claps: null,
                                               comments: null},
                          'reaction_counts': {claps: 0,
                                              comments: 0}
                         };

      this.newses.unshift(news);
      this.streamNews = 3;

      this.newses[0].id = await this.newsService.putNews(createNews, 0, this.missionService.groupId);
      this.streamNews = 1;

    } else {

      this.newses[this.newsIndex].text = postNews.text;
      this.newses[this.newsIndex].pic = postNews.pic;

      await this.newsService.postNews(postNews, 0, this.missionService.groupId);
      this.streamNews = 1;

    }

  }

  async newsDelete(i: number) {
    let _id: string

    _id = this.newses[i].id;
    this.streamNews = 3;

    await this.newsService.deleteNews(_id, 0, this.missionService.groupId);

    this.newses.splice(i, 1),
    this.streamNews = 0;
  }

}
