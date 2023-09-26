import {Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnInit} from '@angular/core';

import {UserService} from '../../../user/services/user-service';

@Component({
  selector: 'people-buttons',
  templateUrl: 'people-buttons.html',
  styleUrls: ['people-buttons.css']
})
export class PeopleButtonsComponent implements OnInit {
  @Input() mode: number;
  // @Input() status: number;
  @Input() sourceType: number;
  @Input() followStatus: boolean;
  @Input() activeId: string;
  @Input() peopleId: string;
  @Input() email: string;
  @Input() peopleStage: number;
  @Input() peopleProgress: boolean[];
  @Input() positionsFlag: boolean;
  @Input() groupFlag: boolean = false;
  @Input() stream: number;
  @Input() streamFollow: number;
  @Input() showEditBtn: boolean;

  @Output() btnResendClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnCancelClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnAcceptClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnDeclineClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnFollowClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnMessageClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnEmailClick: EventEmitter <boolean> = new EventEmitter();

  @ViewChild('toggleShareModal', { static: true }) toggleShare: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  meFlag: boolean = false;
  shareFlag: boolean = false;
  action: string;
  btnsNames: string[];

  constructor(public userService: UserService) { }

  ngOnInit() {
    this.meFlag = (this.peopleId==this.activeId);

    if (this.peopleProgress) this.peopleProgress[3] = this.positionsFlag;

    if (this.meFlag) {
      this.btnsNames = (this.mode==0) ? ['Accept', 'Decline'] : ['Resend Request', 'Cancel Request'];
    } else if (this.showEditBtn) {
      this.btnsNames = (this.mode==0) ? ['Resend Invite', 'Cancel Invite'] : ['Accept', 'Decline'];
    }
  }

  btnLeftFunc(): void {
    if ((this.meFlag && this.mode==0) || (!this.meFlag && this.mode==4)) {
      this.btnAcceptClick.emit(true);
    } else {
      this.btnResendClick.emit(true);
    };
  }

  btnRightFunc(): void {
    if ((this.meFlag && this.mode == 0) || (!this.meFlag && this.mode == 4)) {
      this.btnDeclineClick.emit(true);
    } else {
      this.btnCancelClick.emit(true);
    };
  }

  btnEmailFunc(): void {
    if (this.showEditBtn) {
      this.btnEmailClick.emit(true);
    };
  }

  buttonFollowFunc(): void {
    if (this.userService.userEmailVerified) {
      this.btnFollowClick.emit(true);
    } else {
      this.action = "follow";
      this.toggleSignUp.nativeElement.click();
    }
  }

  buttonMessageFunc(): void {
    if (this.userService.userEmailVerified) {
      this.btnMessageClick.emit(true);
    } else {
      this.action = "message";
      this.toggleSignUp.nativeElement.click();
    }
  }

  openShareModalFunc() {
    if (this.userService.userEmailVerified) {
      this.toggleShare.nativeElement.click();
      this.shareFlag = true;
    } else {
      this.action = "share";
      this.toggleSignUp.nativeElement.click();
    }
  }

  closeShareModalFunc() {
    this.toggleShare.nativeElement.click();
    this.shareFlag = false;
  }

}
