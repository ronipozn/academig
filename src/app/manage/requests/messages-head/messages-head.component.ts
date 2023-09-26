import { Component, Input, Output, EventEmitter } from '@angular/core';

import { serviceTypes, Resource,ResourceService } from '../../../shared/services/resource-service';

@Component({
  selector: 'messages-head',
  templateUrl: './messages-head.component.html',
  styleUrls: ['./messages-head.component.scss'],
})
export class MessagesHeadComponent {
  @Output() deleteChannel: EventEmitter <boolean> = new EventEmitter();

  @Input() resource: Resource;
  @Input() presence: boolean;
  @Input() channelSelected: number;
  @Input() mode: number;

  serviceSelect = serviceTypes;

  currencySymbols = ['$', '€', '£', '₪', '₩', '₽', '₹', '¥', '元'];

  // buttonDeleteFunc() {
  //   this.deleteChannel.emit(true);
  // }

}
