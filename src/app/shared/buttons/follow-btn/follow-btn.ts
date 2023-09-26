import {Component, Input, Output, EventEmitter} from '@angular/core';

import {UserService} from '../../../user/services/user-service';

@Component({
  selector: 'follow-btn',
  templateUrl: 'follow-btn.html',
  styleUrls: ['follow-btn.css']
})
export class FollowBtnComponent {
  @Input() followStatus: boolean;

  @Input() disabledFlag: boolean = false;
  @Input() smallFlag: boolean = false;
  // @Input() linkFlag: boolean = false;

  @Input() streamFollow: number;
  @Input() stream: number;
  @Input() type: number = 0; // 0: Follow
                             // 1: Clap
                             // 2: Watchlist
                             // 3: Compare


  @Output() buttonFollowClick: EventEmitter <boolean> = new EventEmitter();

  showButton: boolean;

  onTypeName: string[] = ["Follow", "Clap", "Add To Watchlist", "Compare"]
  typeIcon: string[] = ["bookmark_border", "plus_one", "", "compare", "bookmark_border"]

  unTypeName: string[] = ["Unfollow", "Unclap", "Remove from Watchlist", "Uncompare"]
  unTypeIcon: string[] = ["bookmark", "plus_one", "", "compare", "bookmark"]

  constructor(private userService: UserService) {}

  buttonFollowFunc(event): void {
    this.buttonFollowClick.emit(true);
  }

}
