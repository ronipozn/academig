import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Channel } from '../../user/services/message.service';
import { titlesTypes} from '../../shared/services/people-service';

@Component({
  selector: 'messages-head',
  templateUrl: './messages-head.component.html',
  styleUrls: ['./messages-head.component.scss'],
})
export class MessagesHeadComponent {
  @Output() deleteChannel: EventEmitter <boolean> = new EventEmitter();

  @Input() channel: Channel;
  @Input() presence: boolean;

  titlesSelect = titlesTypes;

  buttonDeleteFunc() {
    this.deleteChannel.emit(true);
  }


}
