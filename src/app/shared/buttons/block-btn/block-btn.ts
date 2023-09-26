import {Component, Input, Output, EventEmitter} from '@angular/core';

import {UserService} from '../../../user/services/user-service';

@Component({
  selector: 'block-btn',
  templateUrl: 'block-btn.html',
  styleUrls: ['block-btn.css']
})
export class BlockBtnComponent {
  @Input() blockStatus: boolean;
  @Input() disabledFlag = false;
  @Input() streamBlock: number;

  @Output() buttonBlockClick: EventEmitter <boolean> = new EventEmitter();

  showButton: boolean;

  constructor(private userService: UserService) {}

  buttonBlockFunc(event): void {
    this.buttonBlockClick.emit(true);
  }

}
