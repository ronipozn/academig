import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {News, CreateNews, PostNews, NewsService} from '../../shared/services/news-service';

import {Followings, PeopleService} from '../../shared/services/people-service';
import {MissionService} from '../services/mission-service';
import {UserService} from '../../user/services/user-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
    selector: 'profile-news',
    templateUrl: 'news.html',
    styleUrls: ['news.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class NewsComponent {
  streamRetrieved: boolean;
  streamNews = 0;

  newsBuildFlag: boolean = false;
  newsNewFlag: boolean = false;
  newsIndex: number;

  newses: News[] = [];

  offset = 0;
  id: string;

  followings: Followings;

  constructor(public titleService: Title,
              public newsService: NewsService,
              public peopleService: PeopleService,
              public missionService: MissionService,
              public userService: UserService) {
    this.titleService.setTitle('Researcher News - ' + this.missionService.peopleName + ' | Academig');
    if (this.userService.userId) {
      this.getFollowings();
    } else if (this.missionService.peopleId!='academig') {
      this.updateNews();
    }
  }

  loadMore() {
    this.streamRetrieved = false;
    this.offset += 10;
    if (this.missionService.peopleId!='academig') this.updateNews();
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
    const news = await this.newsService.getNews(6, this.offset, this.missionService.peopleId);

    if (news) {
      this.newses.push.apply(this.newses, news);
      this.streamRetrieved = true;
      // this.newOffset = this.offset;
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
                          'object': {'_id': null, 'name': 'profileNews', 'pic': null},
                          'target': {"group": null, "department": null, "university": null},
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

      this.newses[0].id = await this.newsService.putNews(createNews, 3, this.missionService.peopleId);

      this.streamNews = 1;
      this.userService.userProgress[7] = true;

    } else {

      this.newses[this.newsIndex].text = postNews.text;
      this.newses[this.newsIndex].pic = postNews.pic;

      await this.newsService.postNews(postNews, 3, null);

      this.streamNews = 1;

    }

  }

  async newsDelete(i: number) {
    let _id: string = this.newses[i].id;

    this.streamNews = 3;

    await this.newsService.deleteNews(_id, 3, null);

    this.newses.splice(i, 1),
    this.streamNews = 0;
  }

}
