import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { Message } from '../../../user/services/message.service';

import { People } from '../../../shared/services/people-service';
import { objectMini } from '../../../shared/services/shared-service';

@Component({
  selector: 'chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessagesComponent implements OnInit {
  @Output() deleteMessage: EventEmitter <boolean> = new EventEmitter();

  @Input() message: Message;
  @Input() users: People[];
  @Input() userId: string;
  @Input() userPic: string;
  @Input() withPic: string;

  // @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  showButton = false;
  pic: string;

  ngOnInit() {
    this.pic = (this.userId == this.message.userId) ? this.userPic : this.users.filter(r => r._id == this.message.userId)[0].pic;
  }

  buttonOver(showStatus: boolean) {
    // if (this.showEditBtn) {
      this.showButton = showStatus;
    // }
  }

  buttonDeleteFunc() {
    this.deleteMessage.emit(true);
  }

}
