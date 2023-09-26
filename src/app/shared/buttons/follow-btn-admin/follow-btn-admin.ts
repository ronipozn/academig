import {Component, Input, Output, EventEmitter} from '@angular/core';
import {PositionMini} from '../../services/people-service';

@Component({
  selector: 'follow-btn-admin',
  templateUrl: 'follow-btn-admin.html',
  styleUrls: ['follow-btn-admin.css']
})
export class FollowBtnAdminComponent {
  @Input() followStatus: boolean[];
  @Input() linkFlag = false;
  @Input() streamFollow: number[];
  @Input() userPositions: PositionMini;

  @Output() buttonFollowClick: EventEmitter <number> = new EventEmitter();

  showButton: boolean;
  folllowText = 'Following';

  buttonFollowFunc(i: number): void {
    this.buttonFollowClick.emit(i);
  }

  changeText($event) {
    this.folllowText = $event.type == 'mouseover' ? 'Unfollow from' : 'Following';
  }

}
