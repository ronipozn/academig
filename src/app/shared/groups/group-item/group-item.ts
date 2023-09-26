import { Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import {Relation, Group} from '../../services/group-service';
import {PositionMini} from '../../services/people-service';
import {UserService} from '../../../user/services/user-service';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: '[group-item]',
  templateUrl: 'group-item.html',
  styleUrls: ['group-item.css']
})
export class GroupItemComponent {
  @Input() group: Group;
  @Input() sourceType: number;
  @Input() showEditBtn: boolean;
  @Input() compareFlag: boolean = false;
  @Input() companyFlag: boolean = false;
  @Input() compareStatus: boolean;
  @Input() stream: number;
  @Input() streamCompare: number;
  @Input() followStatus: boolean;
  @Input() previewStatus: boolean = false;
  @Input() adminFollowStatus: boolean[];
  @Input() streamFollow: number;
  @Input() streamAdminFollow: number[];

  @Output() buttonEditCollaborationClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonEndCollaborationClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteCollaborationClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonPreviewClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonCompareClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonFollowClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonAdminFollowClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonApproveClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeclineClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @ViewChild('toggleShareModal', { static: true }) toggleShare: ElementRef;
  @ViewChild('toggleReportModal', { static: true }) toggleReport: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  formModel: FormGroup;
  submitStatus: boolean = false;
  hoverButton: boolean = false;

  acronym: string;

  shareFlag: boolean = false;
  action: string;

  relation: Relation;

  adminFlag: boolean = false;

  constructor(
     private datepipe: DatePipe,
     public userService: UserService,
     private authService: AuthService) {
    this.formModel = new FormGroup({
      position: new FormControl('', Validators.required),
      startDate: new FormControl(this.datepipe.transform(new Date(), 'yyyy-MM'), Validators.required)
    });
  }

  ngOnInit() {
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])
    });

    const userPosition: PositionMini = this.userService.userPositions.filter(r => r.group.group._id==this.group.groupIndex.group._id)[0];

    if (userPosition) {
      this.relation = {
        status: userPosition.status,
        mode: userPosition.mode,
        text: null,
        period: userPosition.period,
        email_stage: userPosition.email ? userPosition.email.stage : null
      }
    }

    if (this.group.groupIndex && this.group.groupIndex.group.name) {
      this.acronym = this.group.groupIndex.group.name.match(/\b(\w)/g).join('').substring(0, 2).toUpperCase();
    };

  }

  buttonOver(showStatus: boolean) {
    this.hoverButton = showStatus;
  }

  onSubmit() {
    // if (this.formModel.valid) {
    //   this.update.emit(this.formModel.value);
    // } else {
    //   this.submitStatus=!this.submitStatus;
    // }
  }

  buttonEditCollaborationFunc(event): void {
    this.buttonEditCollaborationClick.emit(true);
  }

  buttonEndCollaborationFunc(event): void {
    this.buttonEndCollaborationClick.emit(true);
  }

  buttonDeleteCollaborationFunc(event): void {
    this.buttonDeleteCollaborationClick.emit(true);
  }

  buttonPreviewFunc(event): void {
    this.buttonPreviewClick.emit(true);
  }

  buttonCompareFunc(event): void {
    if (this.userService.userEmailVerified || this.sourceType==0) {
      this.buttonCompareClick.emit(true);
    } else {
      this.action = "compare";
      this.toggleSignUp.nativeElement.click();
    }
  }

  buttonFollowFunc(event): void {
    if (this.userService.userEmailVerified) {
      this.buttonFollowClick.emit(true);
    } else {
      this.action = "follow";
      this.toggleSignUp.nativeElement.click();
    }
  }

  buttonAdminFollowFunc(i: number): void {
    this.buttonAdminFollowClick.emit(i);
  }

  buttonApproveFunc(event): void {
    this.buttonApproveClick.emit(true);
  }

  buttonDeclineFunc(event): void {
    this.buttonDeclineClick.emit(true);
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

  openReportModalFunc() {
    if (this.userService.userEmailVerified) {
      this.toggleReport.nativeElement.click();
    } else {
      this.action = "report";
      this.toggleSignUp.nativeElement.click();
    }
  }

  closeReportModalFunc() {
    this.toggleReport.nativeElement.click();
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
