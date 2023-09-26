import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Message } from '../../../user/services/message.service';

@Component({
  selector: 'messages-box',
  templateUrl: './messages-box.component.html',
  styleUrls: ['./messages-box.component.scss']
})
export class MessagesBoxComponent {
  @Output() deleteMessage: EventEmitter <boolean> = new EventEmitter();
  @Output() btnPicClick: EventEmitter <string> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @Input() message: Message;
  @Input() messageSpinner: number;
  @Input() messageLastFlag: boolean;
  @Input() userId: string;
  @Input() userPic: string;
  @Input() withPic: string;

  // @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  showButton = false;

  buttonOver(showStatus: boolean) {
    // if (this.showEditBtn) {
      this.showButton = showStatus;
    // }
  }

  buttonDeleteFunc() {
    this.deleteMessage.emit(true);
  }

  picClick(pic: string) {
    this.btnPicClick.emit(pic);
  }

  animationDone(event): void {
    this.showButton = false;
    this.animationDoneEvent.emit(true);
  }

}
