import {Component, Input, Output, EventEmitter} from '@angular/core';

import * as moment from 'moment';

import {currentReport} from '../../../shared/services/private-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'private-assignment-next',
  templateUrl: 'assignment-next.html',
  styleUrls: ['assignment-next.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PrivateAssignmentNextComponent {
  @Input() report: currentReport;
  @Input() sourceType: number; // 0 - lab, 1 - wall
  @Input() userStatus: number;
  @Input() userId: string;
  @Input() validFlag: boolean;
  @Input() streamRetrieved: boolean;

  @Input() remindAllFlag: boolean;
  @Input() streamRemindAll: number;
  @Input() expiredFlag: boolean;
  @Input() streamReports: boolean;
  @Input() stream: number[];

  @Output() buttonClick: EventEmitter <number> = new EventEmitter(true);
  @Output() actionClick: EventEmitter <[number, number]> = new EventEmitter(true);

  buttonFunc(i: number): void {
    this.buttonClick.emit(i);
  }

  actionFunc(i: number, j: number): void {
    this.actionClick.emit([i, j]);
    // i - index
    // j - action
  }

}
