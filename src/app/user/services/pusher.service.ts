import { Injectable, isDevMode } from '@angular/core';
import { environment } from '../../../environments/environment';
import Pusher from 'pusher-js';

declare const Pusher: any;

import {UserService} from './user-service';
import {ToastService} from './toast.service';

@Injectable()
export class PusherService {
  pusher: any;
  messagesChannel: any;
  notificationsChannel: any;

  devFlag: boolean;

  constructor(private userService: UserService,
              private toastService: ToastService) {
    this.devFlag = isDevMode();
  }

  ////////////////////////////
  /////// Notifications //////s
  ////////////////////////////

  public initializeNotificationPusher(userId: string): void {
    // console.log('222',environment.pusher.key,environment.pusher.cluster)
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
      // encrypted: true,
      // authEndpoint: '/pusher/auth',
      authEndpoint: (this.devFlag) ? 'http://localhost:4000/pusher/auth' : 'https://www.academig.com/pusher/auth',
    });
    this.notificationsChannel = this.pusher.subscribe('private-notifications-' + userId);
    // console.log('Notifications Channel subscribe',userId);
  }

  public unsubscribeNotificationPusher(userId: string): void {
    if (this.pusher) this.pusher.unsubscribe(userId);
  }

  public bindNotifications(userId: string) {
    this.notificationsChannel.bind('notifications', data => {
      // console.log('data',data)
      this.userService.userUnseen += 1;
      const message: string = "New notificaition"
       // + data.initiated_by;
      this.toastService.showNotification('bottom', 'left', message);
    });
  }

  public unbindNotifications() {
    if (this.userService.userId) this.notificationsChannel.unbind();
  }

  ////////////////////////////
  ///////// Messages /////////
  ////////////////////////////

  public initializePusher(channelId: string, userId: string): void {
    // console.log('111',environment.pusher.key,environment.pusher.cluster)
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
      // encrypted: true,
      // authEndpoint: '/pusher/auth',
      authEndpoint: (this.devFlag) ? 'http://localhost:4000/pusher/auth' : 'https://www.academig.com/pusher/auth',
      auth: {
        params: {
          userId: userId,
        }
      }
    });
    this.messagesChannel = this.pusher.subscribe(channelId);
    // this.messagesChannel = this.pusher.subscribe(channelId, "55555");
    // console.log('Messages Channel subscribe',channelId);
  }

  public unsubscribePusher(channelId: string): void {
    // console.log('unsubscribePusher',channelId)
    this.pusher.unsubscribe(channelId);
  }

}
