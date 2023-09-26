import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Resource } from '../../../shared/services/resource-service';
import { Channel} from '../../../user/services/message.service';

@Component({
  selector: 'messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.scss'],
})
export class MessagesListComponent {
  @Output() refreshChannel: EventEmitter <boolean> = new EventEmitter();
  @Output() postChannel: EventEmitter <number> = new EventEmitter();

  @Input() mode: number;
  @Input() type: number;
  @Input() selectedFlag: boolean;

  @Input() resource: Resource;
  @Input() channel: Channel;

  showButton: boolean = false;

  // ngOnInit() {
  //   console.log("channel",this.channel)
  //   console.log("resource",this.resource)
  // }

  requestButtonOver(showStatus: boolean) {
    this.showButton = showStatus;
  }

  refreshChannelFunc() {
    this.refreshChannel.emit(true);
  }

  postChannelFunc(type: number) {
    this.postChannel.emit(type);
  }

}
