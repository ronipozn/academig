import {Component, Input, Injectable} from '@angular/core';
// Output, EventEmitter,
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';

import {UserService} from '../user/services/user-service';
import {PeopleService} from '../shared/services/people-service';

import {CookieService} from 'ngx-cookie';

@Component({
  selector: 'read-box',
  templateUrl: 'read-box.html',
  styleUrls: ['read-box.css']
})
export class ReadBoxComponent {
  // @Output() btnCompareClick: EventEmitter <boolean> = new EventEmitter(); // for Landing Component
  @Input() isAuthenticated: boolean;

  constructor(private cookieService: CookieService,
              public dialog: MatDialog) {}

  // async buttonCompareFunc(i: number) {
    // if (this.isAuthenticated) await this.peopleService.toggleFollow(12, 0, _id, false);
  // }

  challengeFlag: boolean = true;

  async challengeFunc() {
    this.dialog.open(ReadBoxDialog);
  }

  removeChallengeFunc() {
    this.cookieService.put("challengebanner", "1");
    // if (this.userService.userId) {
    this.challengeFlag = false;
  }

}

@Component({
  selector: 'read-box-dialog',
  templateUrl: 'read-box-dialog.html',
})
export class ReadBoxDialog {
  challengeGoal: number;
  streamFlag: boolean = false;

  constructor(private userService: UserService,
              private peopleService: PeopleService,
              private router: Router,
              public dialog: MatDialog) {}

  async challengeFunc(mode: boolean) {
    this.streamFlag = true;
    await this.peopleService.toggleChallange(true, this.challengeGoal);
    this.userService.userChallenge = this.challengeGoal;
    this.dialog.closeAll();
    this.router.navigate(['./people',this.userService.userId,'library']);
  }
}
