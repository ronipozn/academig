import { Component, Input } from '@angular/core';

import { objectMini } from '../../../shared/services/shared-service';

@Component({
  selector: 'chat-head',
  templateUrl: './chat-head.component.html',
  styleUrls: ['./chat-head.component.scss'],
})
export class ChatHeadComponent {
  @Input() members: objectMini[];
  @Input() userId: string;
}
