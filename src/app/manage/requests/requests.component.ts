import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';

import { Router, ActivatedRoute, UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';

import { Message, Channel, MessagesSortService, MessageService } from '../../user/services/message.service';
import { UserService } from '../../user/services/user-service';
import { Resource, ResourceService } from '../../shared/services/resource-service';

import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'requests',
  templateUrl: './requests.html',
  styleUrls: ['./requests.css']
})
export class RequestsComponent implements OnInit, OnDestroy, AfterViewChecked {
  resources: Resource[];
  messages: Array<Message>;

  // channels: Array<Channel>;
  // channelsUnSort: Array<Channel>;

  withPic: string;
  modalPic: string;

  disableScrollDown = false;

  channelSelected: number = null;
  streamRetrieved: boolean = false;
  streamResourcesRetrieved: boolean = false;

  presence: boolean;

  unread: string;

  resourceId: string;

  streamMessage: number;

  streamResources: number[];
  streamResourcesFollow: number[];

  mode: number = 1;
  type: number = 0;

  showButton: boolean = false;

  starredLength: number = 0;
  archivedLength: number = 0;

  // streamFile: boolean;
  // file: any;

  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
  @ViewChild('togglePicModal', { static: true }) togglePic: ElementRef;

  private ngInitialUnsubscribe: Subject<string> = new Subject();
  private ngPresenceUnsubscribe: Subject<string> = new Subject();
  private ngUnreadUnsubscribe: Subject<string> = new Subject();

  constructor(
    private messageService: MessageService,
    private resourceService: ResourceService,
    public userService: UserService,
    public sortService: MessagesSortService,
    public router: Router,
    public route: ActivatedRoute
  ) {
    this.messages = [];
  }

  ngOnInit() {
    this.scrollToBottom();

    this.messageService.initialPresenceIds
      .takeUntil(this.ngInitialUnsubscribe)
      .subscribe(value => this.presence = (value.length > 1));

    this.messageService.presenceChange
      .takeUntil(this.ngPresenceUnsubscribe)
      .subscribe(value => this.presence = value.presence);

    // this.messageService.unreadChange
    //   .takeUntil(this.ngUnreadUnsubscribe)
    //   .subscribe(memberId => {
    //     existIndex = this.channels.findIndex(r => r.users[0]._id == memberId)
    //     if (existIndex > -1) this.channels[existIndex].unread += 1;
    // });

    let existIndex: number;
    this.streamRetrieved = false;

    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g ? g.segments : [];

    // console.log('s',s)
    if (s[0].path=="manage-services") {
      this.mode = 0;

      this.route
          .queryParams
          .map(
            params => params['id'],
            this.getRequests(11, null)
          )
          .subscribe(id => this.resourceId = id);

    } else {
      this.mode = 1;
      this.getRequests(12, s[4].path);
    }
  }

  async getRequests(type: number, _id: string) {
    this.streamResourcesRetrieved = false;

    // this.resources = await this.resourceService.getResources<Resource>(0, null, null, 0);
    this.resources = await this.resourceService.getResources<Resource>(type, _id, null, 0);

    console.log('this.resources',this.resources)

    this.streamResources = new Array(this.resources.length).fill(0);
    this.streamResourcesFollow = new Array(this.resources.length).fill(0);

    this.streamResourcesRetrieved = true;

    if (this.mode==0) {
      this.starredLength = this.resources.filter(r => r.channels[0].type==1).length;
      this.archivedLength = this.resources.filter(r => r.channels[0].type==5).length;
    } else {
      this.starredLength = this.resources[0].channels.filter(r => r.type==1).length;
      this.archivedLength = this.resources[0].channels.filter(r => r.type==5).length;
    }

    // console.log('resources',this.resources)
    // console.log('resourceId',this.resourceId)

    if (this.resourceId) {
      const existIndex: number = this.resources.findIndex(r => r._id == this.resourceId)

      // console.log('existIndex',existIndex)

      if (existIndex > -1) this.refreshChannel(existIndex, false); else this.streamRetrieved = true;
    } else if (this.resources[0]) {
      this.refreshChannel(0, false);
    } else {
      this.streamRetrieved = true;
    }

    this.messageService.messagesStream.subscribe(this.newMessageEventHandler.bind(this));
  }

  requestButtonOver(showStatus: boolean) {
    this.showButton = showStatus;
  }

  changeType(i: number) {
    this.type = i;
    this.channelSelected = null;

    var index: number = null;

    if (i==0) {
      index = 0;
    } else if (this.mode==0) {
      index = this.resources.findIndex(r => r.channels[0].type==this.type);
    } else {
      index = this.resources[0].channels.findIndex(r => r.type==this.type);
    }

    this.refreshChannel(index, false)
  }

  private refreshChannel(i: number, unFlag: boolean = true) {
     // || this.channelSelected==null
    if (this.channelSelected!=i) {
      this.messages = [];

      if (i>=0) {
        const channel: Channel = (this.mode==0) ? this.resources[i].channels[0] : this.resources[0].channels[i];

        // unsubscribe from current channel
        // if (unFlag) { this.messageService.unsubscribeChannel('presence-chat-' + this.resources[this.channelSelected].channel._id) }

        this.streamRetrieved = false;
        this.channelSelected = i;

        if (channel) {
          this.withPic = (channel.users[0]) ? channel.users.filter(r => r._id != this.userService.userId)[0].pic : null;
          this.messageService.initializeChannel('presence-chat-' + channel._id);
          this.messageService.initialize();
          this.getMessages(channel._id, i);
        } else {
          this.streamRetrieved = true;
          this.channelSelected = null;
        }

      } else {
        this.streamRetrieved = true;
        this.channelSelected = null;
      }

    }
  }

  private async getMessages(_id: string, i: number) {
    this.messages = await this.messageService.getMessages(_id);

    this.streamRetrieved = true;
    // this.userService.userUnread -= channel.unread;

    if (this.mode==0) {
      this.resources[i].channels[0].unread = 0;
    } else {
      this.resources[0].channels[i].unread = 0;
    }
  }

  private async postChannel(i: number, mode: number, type: number) {
    const itemId: string = (mode==0) ? this.resources[i].channels[0]._id : this.resources[0].channels[i]._id;

    this.streamResources[i] = 3;

    await this.messageService.postChannel(itemId, mode, type);

    this.streamResources[i] = 0;

    if (type==1) {
      this.starredLength++;
    } else if (type==5) {
      this.archivedLength++;
    } else {
      if ((mode==0 && this.resources[i].channels[0].type==1) || (mode==1 && this.resources[0].channels[i].type==1)) {
        this.starredLength--;
      } else {
        this.archivedLength--;
      }
    }

    if (mode==0) { // user requested
      this.resources[i].channels[0].type = type;
    } else { // service owners
      this.resources[0].channels[i].type = type;
    }
  }

  private async deleteChannel() {
    var _id: string;

    if (this.mode==0) {
      _id = this.resources[this.channelSelected]._id
    } else {
      _id = this.resources[0].channels[this.channelSelected]._id
    };

    await this.messageService.deleteChannel(_id);

    this.messages = [];

    if (this.mode==0) {
      this.resources[this.channelSelected].channels[0].message.text = null;
      this.resources[this.channelSelected].channels[0].message.date = null;
    } else {
      this.resources[0].channels[this.channelSelected].message.text = null;
      this.resources[0].channels[this.channelSelected].message.date = null;
    }
  }

  private async createMessage(message: Message) {
    const channelIndex: number = this.channelSelected;
    const messageIndex: number = this.messages.length - 1;
    let absentIds: string[] = [];

    var _id: string;

    if (this.mode==0) {
      this.resources[this.channelSelected].channels[0].message.userId = message.userId;
      this.resources[this.channelSelected].channels[0].message.text = message.text;
      this.resources[this.channelSelected].channels[0].message.date = message.date;
      _id = this.resources[this.channelSelected].channels[0]._id;
    } else {
      this.resources[0].channels[this.channelSelected].message.userId = message.userId;
      this.resources[0].channels[this.channelSelected].message.text = message.text;
      this.resources[0].channels[this.channelSelected].message.date = message.date;
      _id = this.resources[0].channels[this.channelSelected]._id;
    }

    this.streamMessage = 3;

    // if (!this.presence) {
    //   absentIds = [this.channels[this.channelSelected].users[0]._id];
    // }

    this.messages[messageIndex]._id = await this.messageService.putMessage(message, absentIds, _id, null);

    this.streamMessage = 1;

    // this.putMessage(message,this.pusherService.messagesChannel.name.substr(this.pusherService.messagesChannel.name.lastIndexOf('-') + 1))
  }

  private async deleteMessage(i: number) {
    this.messages[i].text = '';
    this.messages[i].file = '';
    this.messages[i].type = 10;

    const _id: string = (this.mode==0) ? this.resources[this.channelSelected].channels[0]._id : this.resources[0].channels[this.channelSelected]._id;

    await this.messageService.deleteMessage(_id, this.messages[i]._id);

    // this.putMessage(message,this.pusherService.messagesChannel.name.substr(this.pusherService.messagesChannel.name.lastIndexOf('-') + 1))
  }

  private newMessageEventHandler(event: Message): void {
    this.messages.push(event);

    // if (this.channelSelected!=0) {
    //   this.channels.unshift(this.channels.splice(this.channelSelected, 1)[0])
    //   this.channelSelected==0;
    // }

    if (this.streamRetrieved) {
      const element = this.myScrollContainer.nativeElement;
      setTimeout(function() {
        element.scrollTo({left: 0 , top: element.scrollHeight, behavior: 'smooth'});
      }, 5);

      if (this.mode==0) {
        this.resources[this.channelSelected].channels[0].message.userId = event.userId;
        this.resources[this.channelSelected].channels[0].message.text = event.text;
        this.resources[this.channelSelected].channels[0].message.date = event.date;
      } else {
        this.resources[0].channels[this.channelSelected].message.userId = event.userId;
        this.resources[0].channels[this.channelSelected].message.text = event.text;
        this.resources[0].channels[this.channelSelected].message.date = event.date;
      }
    }
  }

  picMoal(pic: string) {
    this.modalPic = pic;
    this.togglePic.nativeElement.click();
  }

  streamFunc() {
    this.streamMessage = 0;
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

    this.ngUnreadUnsubscribe.next();
    this.ngUnreadUnsubscribe.complete();

    if (Number.isInteger(this.channelSelected)) {
      this.messageService.unsubscribeBind();
      // FIX // this.messageService.unsubscribeChannel('presence-chat-' + this.channels[this.channelSelected]._id);
      // this.messageService.unsubscribeChannel('private-chat-'+this.channels[this.channelSelected]._id)
    }

    // if (this.messageService.messagesStream) this.messageService.messagesStream.unsubscribe();
    // this.newMessageEventHandler.unbind();
  }

  // async resourceFollow(i: number) {
  //   const itemId: string = this.resources[i]._id;
  //   let toFollow: boolean = !this.resources[i].followStatus;
  //
  //   this.streamResourcesFollow[i] = 3;
  //
  //   await this.peopleService.toggleFollow(1, 0, itemId, toFollow);
  //
  //   this.resources[i].followStatus = toFollow;
  //   this.streamResourcesFollow[i] = 0;
  //   this.userService.toggleFollow(toFollow, itemId, 1);
  // }

}
