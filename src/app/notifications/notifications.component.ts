import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {News, NewsService} from '../shared/services/news-service';
import {UserService} from '../user/services/user-service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {AuthService} from '../auth/auth.service';

import {itemsAnimation} from '../shared/animations/index';

@Component({
    selector: 'notifications',
    templateUrl: 'notifications.html',
    styleUrls: ['notifications.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class NotificationsComponent implements OnInit {
  streamNotificationsRetrieved: boolean = false;
  notifications: News[] = [];
  offset: number = 0;

  constructor(private userService: UserService,
              private newsService: NewsService,
              private titleService: Title,
              private authService: AuthService) {
    this.titleService.setTitle('Notifications | Academig');
  }

 async ngOnInit() {
   await this.authService.getAuth0Client();

   this.offset = 0;
   this.notifications = [];
   this.getNotifications();
  }

  loadMoreNotifications() {
    this.offset += 10;
    this.getNotifications();
  }

  async getNotifications() {
    this.streamNotificationsRetrieved = false;

    const notifications = await this.newsService.getNews(4, this.offset, null);

    if (notifications) {
      this.notifications.push.apply(this.notifications, notifications);
      this.streamNotificationsRetrieved = true;
    }

    this.userService.userUnseen = 0;
  }

}
