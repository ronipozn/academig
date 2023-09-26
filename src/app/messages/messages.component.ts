import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Message, Channel, MessagesSortService, MessageService } from '../user/services/message.service';
import { UserService } from '../user/services/user-service';

import { People, PeopleService } from '../shared/services/people-service';
import { NewsService } from '../shared/services/news-service';

import { objectMini } from '../shared/services/shared-service';

import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'messages',
  templateUrl: './messages.html',
  styleUrls: ['./messages.css']
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  messages: Array<Message>;

  channels: Array<Channel>;
  channelsUnSort: Array<Channel>;

  members: People[][];

  withPic: string;
  modalPic: string;

  disableScrollDown = false;

  channelSelected: number;
  streamRetrieved = false;
  // colleaguesRetrieved: boolean = false;

  presence: boolean;

  unread: string;

  streamMessage: number;

  // streamFile: boolean;
  // file: any;

  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
  @ViewChild('togglePicModal', { static: true }) togglePic: ElementRef;

  private ngInitialUnsubscribe: Subject<string> = new Subject();
  private ngPresenceUnsubscribe: Subject<string> = new Subject();
  private ngUnreadUnsubscribe: Subject<string> = new Subject();

  constructor(
    private messageService: MessageService,
    private newsService: NewsService,
    private peopleService: PeopleService,
    public userService: UserService,
    public sortService: MessagesSortService
  ) {
    this.messages = [];
    this.channels = [];
  }

  ngOnInit() {
    this.scrollToBottom();

    let existIndex: number;

    this.messageService.initialPresenceIds
      .takeUntil(this.ngInitialUnsubscribe)
      .subscribe(value => this.presence = (value.length > 1));

    this.messageService.presenceChange
      .takeUntil(this.ngPresenceUnsubscribe)
      .subscribe(value => this.presence = value.presence);

    this.messageService.unreadChange
      .takeUntil(this.ngUnreadUnsubscribe)
      .subscribe(memberId => {
        existIndex = this.channels.findIndex(r => r.users[0]._id == memberId)
        if (existIndex > -1) {
          this.channels[existIndex].unread += 1;
        }
    });

    this.members = [(new Array(this.userService.userPositions.length).fill(0))];

    this.userService.userPositions.forEach((r, index) => {
      this.peoplesFunc(r.group.group._id, index)
    });

    this.getChannels();
    // this.streamChannels=new Array(this.channels.length).fill(0);
  }

  async getChannels() {
    let existIndex: number;
    this.streamRetrieved = false;

    const data = await this.messageService.getChannels();

    this.channelsUnSort = data.map(function(r) {
        r.message = r.message ? r.message : {_id: null,
                                             type: null,
                                             userId: null,
                                             text: null,
                                             file: null,
                                             date: null};
        return r
    });

    this.channels = this.channelsUnSort.slice(0); // avoid mutating, duplicate array instead
    this.sortService.arraySort(this.channels);

    if (this.userService.newChannel) {

      existIndex = this.channels.findIndex(r => r.users[0] && r.users[0]._id == this.userService.newChannel.users[0]._id)

      if (existIndex > -1) {
        this.updateChannel(existIndex, false);
      } else {
        // console.log('222')
        this.createChannel(this.userService.newChannel);
      };

    } else if (this.channels[0]) {
      this.updateChannel(0, false);
    } else {
      this.streamRetrieved = true;
    }

    this.messageService.messagesStream.subscribe(this.newMessageEventHandler.bind(this));
  }

  async peoplesFunc(groupId: string, i: number) {
    this.members[i] = await this.peopleService.getPeoples(1, groupId, null, 0, 1);
    // this.colleaguesRetrieved=true;
  }

  scrollToBottom() {
    try {
      if (this.disableScrollDown == false) {
        const element = this.myScrollContainer.nativeElement;
        element.scrollTo({left: 0 , top: element.scrollHeight});
        this.disableScrollDown = true;
      }
     } catch (err) { }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    // if (this.messageService.messagesStream) this.messageService.messagesStream.unsubscribe();
    // this.newMessageEventHandler.unbind();

    this.ngInitialUnsubscribe.next();
    this.ngInitialUnsubscribe.complete();

    this.ngPresenceUnsubscribe.next();
    this.ngPresenceUnsubscribe.complete();

    this.ngUnreadUnsubscribe.next();
    this.ngUnreadUnsubscribe.complete();

    if (Number.isInteger(this.channelSelected)) {
      this.messageService.unsubscribeBind();
      this.messageService.unsubscribeChannel('presence-chat-' + this.channels[this.channelSelected]._id);
      // this.messageService.unsubscribeChannel('private-chat-'+this.channels[this.channelSelected]._id)
    }
  }

  private async createChannel(channel: Channel) {
    this.streamRetrieved = false;
    this.channelSelected = 0;
    this.messages = [];
    this.withPic = channel.users[0].pic;

    this.channels.unshift(channel);
    this.userService.newChannel = null;

    this.channels[0]._id = await this.messageService.putChannel([this.userService.userId].concat(this.channels[0].users.map(r => r._id)));

    this.messageService.initializeChannel('presence-chat-' + this.channels[0]._id);
    this.messageService.initialize();
    this.streamRetrieved = true;
  }

  private updateChannel(i: number, unFlag: boolean = true) {
    if (this.channelSelected != i) {
      // unsubscribe from cuurent channel
      // if (unFlag) this.messageService.unsubscribeChannel('private-chat-'+this.channels[this.channelSelected]._id)
      if (unFlag) this.messageService.unsubscribeChannel('presence-chat-' + this.channels[this.channelSelected]._id)

      this.streamRetrieved = false;
      this.channelSelected = i;
      this.messages = [];
      // console.log('this.channels[i].users',this.channels[i].users)
      this.withPic = this.channels[i].users[0] ? this.channels[i].users.filter(r => r._id != this.userService.userId)[0].pic : null;

      // this.messageService.initializeChannel('private-chat-'+this.channels[i]._id);
      this.messageService.initializeChannel('presence-chat-' + this.channels[i]._id);
      this.messageService.initialize();

      this.getMessages(i);
    }
  }

  private async getMessages(i: number) {
    this.messages = await this.messageService.getMessages(this.channels[i]._id);
    this.streamRetrieved = true;
    this.userService.userUnread -= this.channels[i].unread;
    this.channels[i].unread = 0;
  }

  private async deleteChannel() {
    await this.messageService.deleteChannel(this.channels[this.channelSelected]._id);

    this.messages = []
    this.channels[this.channelSelected].message.text = null;
    this.channels[this.channelSelected].message.date = null;
  }

  private async createMessage(message: Message) {
    const channelIndex: number = this.channelSelected;
    const messageIndex: number = this.messages.length - 1;
    let absentIds: string[] = [];

    this.channels[this.channelSelected].message.userId = message.userId;
    this.channels[this.channelSelected].message.text = message.text;
    this.channels[this.channelSelected].message.date = message.date;

    this.streamMessage = 3;

    if (!this.presence) absentIds = [this.channels[this.channelSelected].users[0]._id];

    this.messages[messageIndex]._id = await this.messageService.putMessage(message, absentIds, this.channels[this.channelSelected]._id, null);
    this.streamMessage = 1;
    // this.putMessage(message,this.pusherService.messagesChannel.name.substr(this.pusherService.messagesChannel.name.lastIndexOf('-') + 1))
  }

  private async deleteMessage(i: number) {
    this.messages[i].text = '';
    this.messages[i].file = '';
    this.messages[i].type = 10;

    await this.messageService.deleteMessage(this.channels[this.channelSelected]._id, this.messages[i]._id);
    // this.putMessage(message,this.pusherService.messagesChannel.name.substr(this.pusherService.messagesChannel.name.lastIndexOf('-') + 1))
  }

  private newMessageEventHandler(event: Message): void {
    this.messages.push(event);

    // console.log('1111',this.channelSelected)
    // if (this.channelSelected!=0) {
    //   this.channels.unshift(this.channels.splice(this.channelSelected, 1)[0])
    //   this.channelSelected==0;
    // }

    if (this.streamRetrieved) {
      const element = this.myScrollContainer.nativeElement;
      setTimeout(function() {
        element.scrollTo({left: 0 , top: element.scrollHeight, behavior: 'smooth'});
      }, 5);

      this.channels[this.channelSelected].message.userId = event.userId;
      this.channels[this.channelSelected].message.text = event.text;
      this.channels[this.channelSelected].message.date = event.date;
    }
  }

  private memberFunc(i: number, j: number) {
    this.newConversation(this.members[i][j]);
  }

  // private newConversation(i: number, j: number) {
  private newConversation(member: People) {
    let existIndex: number;

    existIndex = this.channels.findIndex(r => r.users[0]._id == member._id)

    if (existIndex > -1) {

      this.updateChannel(existIndex, false);

    } else {

      this.userService.newChannel = {
                                   _id: null,
                                   block: null,
                                   unread: 0,
                                   type: 0,
                                   usersIds: [member._id],
                                   users: [member],
                                   message: {_id: null,
                                             type: null,
                                             userId: null,
                                             text: null,
                                             file: null,
                                             date: null
                                            }
                                  };

      this.createChannel(this.userService.newChannel);

    };

  }

  picMoal(pic: string) {
    this.modalPic = pic;
    this.togglePic.nativeElement.click();
  }

  streamFunc() {
    this.streamMessage = 0;
  }

}
