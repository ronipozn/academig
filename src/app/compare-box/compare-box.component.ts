import {Component, Input, Output, EventEmitter, Injectable} from '@angular/core';

import {UserService} from '../user/services/user-service';
import {PeopleService} from '../shared/services/people-service';

import {CookieService} from 'ngx-cookie';

@Component({
  selector: 'compare-box',
  templateUrl: 'compare-box.html',
  styleUrls: ['compare-box.css']
})
export class CompareBoxComponent {
  @Output() btnCompareClick: EventEmitter <boolean> = new EventEmitter(); // for Landing Component

  @Input() isAuthenticated: boolean;

  @Input() set setMinimize(value: boolean) {
    this.compareMinimizeFlag = value;
  }

  compareMinimizeFlag: boolean = false;

  constructor(public userService: UserService,
              private cookieService: CookieService,
              private peopleService: PeopleService) {}

  async buttonCompareFunc(i: number) {
    const _id = this.userService.userCompareGroups[i]._id;

    this.userService.announceUnCompare(_id);
    this.userService.userCompareGroups.splice(i, 1);
    this.btnCompareClick.emit(true);

    if (this.isAuthenticated) await this.peopleService.toggleFollow(12, 0, _id, false);
  }

  toggleMinmize() {
    this.compareMinimizeFlag=!this.compareMinimizeFlag;
    this.cookieService.put("compare", this.compareMinimizeFlag ? "1" : "0");
  }

}
