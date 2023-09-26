import { Component, Input, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Message, Channel } from '../../user/services/message.service';
import { MessageService } from '../../user/services/message.service';
import { UserService } from '../../user/services/user-service';

import { People, PeopleService } from '../../shared/services/people-service';
import { objectMini } from '../../shared/services/shared-service';

import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'private-chat',
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class PrivateChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;

  @Input() groupId: string;
  @Input() sourceType: number;
  @Input() userStatus: number;

  messages: Array<Message> = [];
  channel: Channel;

  withPic: string;

  streamRetrieved = false;

  disableScrollDown = false;

  membersPresent: objectMini[] = [];

  streamFile: boolean;
  file: any;

  private ngInitialUnsubscribe: Subject<string> = new Subject();
  private ngPresenceUnsubscribe: Subject<string> = new Subject();
  private ngUnreadUnsubscribe: Subject<string> = new Subject();

  constructor(
    private messageService: MessageService,
    private peopleService: PeopleService,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.messageService.initialPresenceIds
    .takeUntil(this.ngInitialUnsubscribe)
    .subscribe(ids => {
        ids.forEach((id, index) => {
          const obj = this.channel.users.find(o => o._id === id);
          if (obj) { this.membersPresent.push({_id: obj._id, name: obj.name, pic: obj.pic}) }
        });
      }
    );

    this.messageService.presenceChange
    .takeUntil(this.ngPresenceUnsubscribe)
    .subscribe(value => {
        if (value.presence) {
          const obj = this.channel.users.find(o => o._id === value._id);
          this.membersPresent.push({_id: obj._id, name: obj.name, pic: obj.pic})
        } else {
          const index = this.membersPresent.findIndex(o => o._id === value._id);
          if (index > -1) { this.membersPresent.splice(index, 1); }
        }
      }
    );

    this.getChannels();
  }

  async getChannels() {
    this.streamRetrieved = false;

    const data = await this.messageService.getChannels(this.groupId, 1);

    this.channel = data[0];
    this.updateChannel();
    this.messageService.messagesStream.subscribe(this.newMessageEventHandler.bind(this));
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
    this.ngInitialUnsubscribe.next();
    this.ngInitialUnsubscribe.complete();

    this.ngPresenceUnsubscribe.next();
    this.ngPresenceUnsubscribe.complete();

    if (this.channel) {
      this.messageService.unsubscribeBind();
      this.messageService.unsubscribeChannel('presence-group-' + this.channel._id)
    }
  }

  private async updateChannel() {
    this.streamRetrieved = false;
    this.messages = [];
    // this.withPic = this.channel.users[0].pic;

    this.messageService.initializeChannel('presence-group-' + this.channel._id);
    this.messageService.initialize();

    this.messages = await this.messageService.getMessages(this.channel._id, 1);
    this.streamRetrieved = true;
    this.channel.unread = 0;
  }

  private async createMessage(message: Message) {
    const messageIndex: number = this.messages.length - 1;
    const absentIds: string[] = [];

    const element = this.myScrollContainer.nativeElement;
    setTimeout(function() {
      element.scrollTo({left: 0 , top: element.scrollHeight, behavior: 'smooth'});
    }, 5);

    // if (!this.presences && this.channel.users[0]) {
    //   absentIds = [this.channel.users[0]._id];
    // }

    this.messages[messageIndex]._id = await this.messageService.putMessage(message, absentIds, this.channel._id, this.groupId, 1);
  }

  private async deleteMessage(i: number) {
    this.messages[i].text = '';
    this.messages[i].file = '';
    this.messages[i].type = 10;

    await this.messageService.deleteMessage(this.channel._id, this.messages[i]._id);
  }

  private newMessageEventHandler(event: Message): void {
    this.messages.push(event);

    if (this.streamRetrieved) {
      const element = this.myScrollContainer.nativeElement;
      setTimeout(function() {
        element.scrollTo({left: 0 , top: element.scrollHeight, behavior: 'smooth'});
      }, 5);
    }
  }

}
