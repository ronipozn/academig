import {Component, Input, Output, EventEmitter} from '@angular/core';

import {ReportItem} from '../../../shared/services/people-service';

@Component({
  selector: '[private-assignment-item]',
  templateUrl: 'assignment-item.html'
})
export class PrivateAssignmentItemComponent {
  @Input() report: ReportItem;
  @Input() sourceType: number; // 0 - lab, 1 - wall
  @Input() profileId: string;
  @Input() userId: string;

  @Output() buttonClick: EventEmitter <boolean> = new EventEmitter(true);

  meFlag: boolean; // profile match active user Flag

  ngOnChanges() {
    this.meFlag = (this.userId == this.profileId)
  }

  buttonFunc(): void {
    this.buttonClick.emit(true);
  }

}
