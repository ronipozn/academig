import {Component, OnInit, Input, ViewChild} from '@angular/core';

import {PeopleService} from '../../shared/services/people-service';
import {UserService} from '../../user/services/user-service';

@Component({
  selector: 'library-challenge',
  templateUrl: 'challenge.html',
  styleUrls: ['challenge.css'],
})
export class ChallengeComponent implements OnInit {
  @Input() userRead: string;
  @Input() sourceType: number; // 0 - library
                               // 1 - background
                               // 2 - top

  challengeGoal: number;
  challengeEdit: boolean;

  constructor(private peopleService: PeopleService,
              public userService: UserService) { }

  ngOnInit() {

  }

  async challengeFunc(mode: boolean) {
    await this.peopleService.toggleChallange(mode, this.challengeGoal);
    this.userService.userChallenge = mode ? this.challengeGoal : 0;
    this.challengeEdit = false;
  }

}
