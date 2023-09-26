import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Project} from '../../services/project-service';

import {trigger, state, style, animate, transition, keyframes} from '@angular/animations';

import {itemsAnimation} from '../../animations/index';
import {UserService} from '../../../user/services/user-service';

@Component({
  selector: 'project-item',
  templateUrl: 'project-item.html',
  styleUrls: ['project-item.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' },
})
export class ProjectItemComponent {
  @Input() project: Project;
  @Input() sourceType: number; // 0 - group
                               // 1 - wall
                               // 2 - search
                               // 3 - project
                               // 4 - relation
                               // 5 - profile
                               // 6 - department
                               // 7 - university
                               // 8 - group AI
  @Input() showEditBtn: boolean;
  @Input() followStatus: boolean;

  @Input() aiFlag: boolean = false;

  @Input() stream: number;
  @Input() streamFollow: number;

  @Input() streamSuggestion: number = 0;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonFollowClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonMoveClick: EventEmitter <boolean> = new EventEmitter();

  @Output() buttonAcceptClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonRejectClick: EventEmitter <boolean> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @ViewChild('toggleShareModal', { static: true }) toggleShare: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  shareFlag: boolean = false;
  action: string;

  constructor(public userService: UserService) { }

  buttonEditFunc() {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc() {
    this.buttonDeleteClick.emit(true);
  }

  buttonAccpetFunc() {
    this.buttonAcceptClick.emit(true);
  }

  buttonRejectFunc() {
    this.buttonRejectClick.emit(true);
  }

  buttonFollowFunc(event): void {
    if (this.userService.userEmailVerified) {
      this.buttonFollowClick.emit(true);
    } else {
      this.action = "follow";
      this.toggleSignUp.nativeElement.click();
    }
  }

  buttonMoveFunc(): void {
    this.buttonMoveClick.emit(true);
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

  animationDone() {
    this.animationDoneEvent.emit(true);
  }

}
