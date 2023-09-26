import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

import {Observable, of} from 'rxjs';
import {ReplaySubject, Subject} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import {PusherService} from './pusher.service';
import {People} from '../../shared/services/people-service';

import {UserService} from './user-service';
import {AuthService} from '../../auth/auth.service';
import {ToastService} from './toast.service';

import {NGXLogger} from 'ngx-logger';

export interface Message {
  _id: string;
  type: number; // 0 - text
                // 1 - file
                // 10 - deleted
  userId: string;
  text: string;
  file: string;
  date: Date;
}

export interface Channel {
  _id: string;
  block: number;
  unread: number;
  type: number; // 0 - regular
                // 1 - Starred
                // 2 - Unread
                // 3 - Finalized (requests) Pulled / Expired / Accepted / Declined
                // 4 - Pending Requests (requests)
                // 5 - Archive
  usersIds: string[];
  users: People[];
  message: Message;
}

export interface Presence {
  _id: string;
  presence: boolean;
}

@Injectable()
export class MessageService {
  messagesStream = new ReplaySubject<Message>(1);

  presence: boolean;

  initialPresenceIds: Subject<string[]> = new Subject<string[]>();
  presenceChange: Subject<Presence> = new Subject<Presence>();

  unreadChange: Subject<string> = new Subject<string>();

  constructor(private pusherService: PusherService,
              private toastService: ToastService,
              private userService: UserService,
              private authService: AuthService,
              private http: HttpClient,
              private router: Router,
              private logger: NGXLogger
            ) {
    // this.presenceChange.subscribe((value) => {
    //   this.presence = value
    // });
    //
    // this.unreadChange.subscribe((value) => {
    //   console.log('tomer',value)
    // });
  }

  initializeChannel(channelId: string) {
    this.pusherService.initializePusher(channelId, this.userService.userId);
  }

  unsubscribeChannel(channelId: string) {
    this.pusherService.unsubscribePusher(channelId);
  }

  initialize() {
    this.pusherService.messagesChannel.bind('client-new-message', (message) => {
      // console.log('message channel bind')
      this.emitNewMessage(message);
    });

    this.pusherService.messagesChannel.bind('pusher:subscription_succeeded', (membersObject) => {
      // console.log('members',membersObject)
      const keyNames = Object.keys(membersObject.members);
      this.updatePresenceIds(keyNames)
      // this.updatePresence((members.count>1))
    });

    this.pusherService.messagesChannel.bind('pusher:member_added', (member) => {
      // console.log('member_added',member)
      this.updatePresence({'_id': member.id, 'presence': true})
    });

    this.pusherService.messagesChannel.bind('pusher:member_removed', (member) => {
      // console.log('member_removed',member)
      this.updatePresence({'_id': member.id, 'presence': false})
    });
  }

  unsubscribeBind() {
    // console.log('message channel unbind')
    if (this.userService.userId && this.pusherService.messagesChannel) this.pusherService.messagesChannel.unbind();
  }

  send(message: Message) {
    // console.log('client-new-message',this.pusherService.messagesChannel.name)
    this.pusherService.messagesChannel.trigger('client-new-message', message);
    this.emitNewMessage(message);
  }

  emitNewMessage(message: Message) {
    this.messagesStream.next(message);
  }

  updatePresenceIds(ids: string[]) {
    this.initialPresenceIds.next(ids);
  }

  updatePresence(presence: Presence) {
    this.presenceChange.next(presence);
  }

  /////////////////////////////////////
  /////////////////////////////////////
  /////////////////////////////////////

  // Channel[]
  async getChannels(itemId: string = null, mode: number = 0): Promise<any> {
    // 0 - one-to-one
    // 1 - group chat

    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getChannels?id=' + itemId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getChannels', []));
  }

  // Message[]
  async getMessages(channelId: string, mode: number = 0): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getMessages?id=' + channelId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMessages', []));
  }

  async putChannel(ids: string[]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/channel.json', ids, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putChannel', []));
  }

  async postChannel(channelId: string, mode: number, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/channel.json?id=' + channelId + '&mode=' + mode + '&type=' + type, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postChannel', []));
  }

  async deleteChannel(channelId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/channel.json?id=' + channelId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteChannel', []));
  }

  async putMessage(message: Message, absentIds: string[], channelId: string, groupId: string, mode: number = 0): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/message.json?id=' + channelId + '&groupId=' + groupId + '&mode=' + mode, {'message': message, 'ids': absentIds}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putMessage', []));
  }

  async deleteMessage(channelId: string, messageId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/message.json?id=' + channelId + '&messageId=' + messageId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteMessage', []));
  }

  public message_notification(userId: string) {

    this.pusherService.notificationsChannel.bind('one-to-one-chat-request', data => {
      this.logger.debug('chat request',data);

      // MY_USER_ID would need to be stored somewhere and in this case the value would be 'user_one'.
      // expectingChatWith should make sure user_one is waiting for a private chat response with the given user
      if (data.initiated_by === userId) {
        // && this.expectingChatWith(data.chat_with)
        // this.startPrivateChat(data.chat_with, data.channel_name);

      } else if (data.chat_with === userId) {

        if (this.router.url == '/messages') {
          this.unreadChange.next(data.initiated_by);
        } else {
          this.userService.userUnread += 1;
          const message: string = "New message from: " + data.initiated_by;
          this.toastService.showNotification('bottom', 'left', message);
        }
        // this.accepted(data.initiated_by,data.channel_name);
        // displayChatPrompt( data );
      }

    });
  }

  // callback when the user accepts the chat request
  // accepted(chatUserId, channelName) {
  //   this.startPrivateChat(chatUserId, channelName);
  // }

  // the user doesn't want to chat
  // declined(chatUserId) {
    // send info to the server indicating declined request
  // }

  startPrivateChat(withUserId, channelName) {
    this.initializeChannel(channelName);
    this.initialize();
    // this.privateChats[ withUserId ] = this.pusher.subscribe(channelName);
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) { }

}

@Injectable()
export class MessagesSortService {

  arraySort(array): void {

    const asc = 1;

    const x1 = asc ? 1 : -1
    const x2 = asc ? -1 : 1

    array.sort((a: Channel, b: Channel) => {
      if (a.message.date < b.message.date) {
        return x1;
      } else if (a.message.date  > b.message.date) {
        return x2;
      } else {
        return 0;
      }
    });
  }
}
