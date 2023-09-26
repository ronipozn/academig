import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {ServicePriceType, serviceTypes, Resource} from '../../services/resource-service';

import {UserService} from '../../../user/services/user-service';

@Component({
  selector: 'resource-item',
  templateUrl: 'resource-item.html',
  styleUrls: ['resource-item.css']
})
export class ResourceItemComponent {
  @Input() resource: Resource;
  @Input() sourceType: number; // 0 - group
                               // 1 - wall
                               // 2 - project
                               // 3 - search
                               // 4 - relation
                               // 5 - profile
                               // 6 - department
                               // 7 - university
                               // 8 - request
                               // 9 - group AI
  @Input() showEditBtn: number;
  @Input() followStatus: boolean;
  @Input() stream: number;
  @Input() streamFollow: number;
  @Input() deleteFlag = false;

  @Input() streamSuggestion: number = 0;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number> = new EventEmitter();

  @Output() buttonFollowClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @ViewChild('toggleShareModal', { static: true }) toggleShare: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  shareFlag: boolean = false;
  action: string;
  
  currencySymbols = ['$', '€', '£', '₪', '₩', '₽', '₹', '¥', '元'];
  serviceSelect = serviceTypes;
  servicePriceType = ServicePriceType;

  constructor(public userService: UserService) { }

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

  buttonEditFunc() {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc() {
    this.buttonDeleteClick.emit(true);
  }

  buttonSuggestionFunc(i: number) {
    this.buttonSuggestionClick.emit(i);
  }

  buttonFollowFunc(event): void {
    if (this.userService.userEmailVerified) {
      this.buttonFollowClick.emit(true);
    } else {
      this.action = "follow";
      this.toggleSignUp.nativeElement.click();
    }
  }

  animationDone() {
    this.animationDoneEvent.emit(true);
  }

}
