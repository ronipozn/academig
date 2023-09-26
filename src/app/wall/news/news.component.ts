import {Component, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';

import {Followings, PeopleService} from '../../shared/services/people-service';
import {News, CreateNews, NewsService} from '../../shared/services/news-service';
import {UserService} from '../../user/services/user-service';
import {InviteService} from '../../shared/services/invite-service';

@Component({
    selector: 'wall-news',
    templateUrl: 'news.html',
    styleUrls: ['news.css'],
})
export class WallNewsComponent implements OnDestroy {
  navigationSubscription: Subscription;

  streamRetrieved: boolean;
  streamNews = 0;

  newId: string = null;
  newses: News[] = [];

  searchTextGroup: string;
  searchTextPosition: string;

  offset = 0;
  newOffset = 0;
  type: number;

  followings: Followings;

  newsBuildFlag = false;

  constructor(public titleService: Title,
              public newsService: NewsService,
              public peopleService: PeopleService,
              public route: ActivatedRoute,
              public userService: UserService,
              public inviteService: InviteService,
              public router: Router) {

    this.titleService.setTitle('News - Academig');

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.getFollowings()
      }
    });
    this.getFollowings();
  }

  async getFollowings() {
    let newGroupId: string = this.route.snapshot.params['groupId'];
    let id: string = newGroupId ? newGroupId : this.userService.userId;

    if (id!=this.newId) {
      const followings = await this.peopleService.getFollowings();

      if (followings) {
        this.followings = followings;
        this.updateNews(true);
      }
    }
  }

  async updateNews(initNews: boolean) {
    let newGroupId: string = this.route.snapshot.params['groupId'];
    let id: string = newGroupId ? newGroupId : this.userService.userId;

    if (id!=this.newId || this.newOffset!=this.offset) {

      this.type = newGroupId ? 2 : 3; // FIX: 2 can be deleted
      if (initNews) this.newses = [];

      this.newId = id;
      this.streamRetrieved = false;

      const news: News[] = await this.newsService.getNews(this.type, this.offset, (this.type==2) ? id : null);

      // console.log('news',news)

      if (news) {
        this.newses.push.apply(this.newses, news);
        this.streamRetrieved = true;
        this.newOffset = this.offset;
        this.userService.userNewsLength=this.newses.length;
      }
    }
  }

  loadMore() {
    this.offset += 10;
    this.updateNews(false);
  }

  // public newsBind(userId: string) {
    // this.pusherService.bindNotifications(userId);
  // };

  // public notifications() {
    // this.pusherService.notificationsChannel.bind('news', data => {
      // this.updatePage();
    // });
  // }

  newsSlide(flag: boolean, i: number, newFlag: boolean) {
    this.newsBuildFlag = flag;
  }

  async newsCreate(event) {
    this.newsBuildFlag = false;

    const createNews: CreateNews = {
                                    'actorId': this.userService.userId,
                                    'verb': 20000,
                                    'objectId': null,
                                    'text': event.text,
                                    'pic': event.pic,
                                    'ai': null
                                   };

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

    await this.newsService.putNews(createNews, 3, this.userService.userId);
    this.streamNews = 1

    // this.newses[0]._id=data;
  }

  ngOnDestroy() {
    if (this.navigationSubscription) this.navigationSubscription.unsubscribe();
  }

}
