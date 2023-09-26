import {Component, Input, Output, OnInit, EventEmitter, ElementRef, ViewChild} from '@angular/core';

import {objectMini, groupComplex} from '../../services/shared-service';

import {UserService} from '../../../user/services/user-service';

@Component({
    selector: 'details-buttons',
    templateUrl: 'details-buttons.html',
    styleUrls: ['details-buttons.css']
})
export class DetailsButtonsComponent implements OnInit {
  @Input() sourceType = 0; // 0 - Non-news pages
                           // 1 - Group / Department / University news
                           // 2 - Wall news

  @Input() mode: number; // 0: group
                         // 1: people
                         // 2: publication
                         // 3: resource
                         // 4: project
                         // 5: job posting

  @Input() userId: string;

  @Input() item: objectMini;
  @Input() groupIndex: objectMini;

  @Input() streamFollow: number;
  @Input() streamBlock: number;

  @Input() followStatus: boolean;
  @Input() blockStatus: boolean;

  @Input() followDisabled: boolean = false;
  @Input() followFlag: boolean = true;
  @Input() meFlag: boolean = false;
  @Input() deadlineDays: number;

  @Output() buttonApplyClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonFollowClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonBlockClick: EventEmitter <boolean> = new EventEmitter();

  @ViewChild('toggleShareModal', { static: true }) toggleShare: ElementRef;
  @ViewChild('toggleReportModal', { static: true }) toggleReport: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  constructor(public userService: UserService) {}

  shareFlag = false;
  action: string;
  modeText: string[] = ['group','people','publication','service','project','job posting'];

  ngOnInit() {
    const that = this;
    if (!this.userService.userEmailVerified && this.mode==2) {
      setTimeout(function() {
        that.action = "claim";
        that.toggleSignUp.nativeElement.click();
      }, 4000);
    }
  }

  buttonApplyFunc(): void {
    if (this.userService.userEmailVerified) {
      this.buttonApplyClick.emit(true);
    } else {
      this.action = "apply";
      this.toggleSignUp.nativeElement.click();
    }
  }

  buttonFollowFunc(): void {
    if (this.userService.userEmailVerified) {
      this.buttonFollowClick.emit(true);
    } else {
      this.action = "follow";
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

  openReportModalFunc() {
    if (this.userService.userEmailVerified) {
      this.toggleReport.nativeElement.click();
    } else {
      this.action = "report";
      this.toggleSignUp.nativeElement.click();
    }
  }

  closeShareModalFunc() {
    this.toggleShare.nativeElement.click();
    this.shareFlag = false;
  }

  closeReportModalFunc() {
    this.toggleReport.nativeElement.click();
  }

}
