import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import {Router} from '@angular/router';

import {People} from '../../shared/services/people-service';
import {PersonalInfo, PrivateService} from '../../shared/services/private-service';
import {PeopleService} from '../../shared/services/people-service';
import {UserService} from '../../user/services/user-service';

import {objectMini, SharedService} from '../../shared/services/shared-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
  selector: 'polls',
  templateUrl: 'polls.html',
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PollsComponent implements OnInit {
  @Input() groupId: string;
  @Input() sourceType: number; // 0 - regular, 1 - wall
  @Input() userId: string;

  @Output() progress: EventEmitter <boolean> = new EventEmitter(true);

  streamRetrieved: boolean[] = [];

  constructor(public peopleService: PeopleService,
              public sharedService: SharedService,
              public privateService: PrivateService,
              private userService: UserService,
              private _router: Router) {}

  ngOnInit() {
    // this.streamRetrieved = [false, false];
  }

}
