import {Component, Input, Output, OnInit, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Outreach} from '../../services/outreach-service';
import {DomSanitizer} from '@angular/platform-browser';

import {trigger, state, style, animate, transition, keyframes} from '@angular/animations';

import {itemsAnimation} from '../../animations/index';
import {UserService} from '../../../user/services/user-service';
import {SharedService} from '../../../shared/services/shared-service';

@Component({
  selector: 'outreach-item',
  templateUrl: 'outreach-item.html',
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' },
})
export class OutreachItemComponent implements OnInit {
  @Input() outreach: Outreach;
  @Input() sourceType: number; // 0 - group
                               // 1 - wall
                               // 2 - search
                               // 3 - project
                               // 4 - relation
                               // 5 - profile
                               // 6 - department
                               // 7 - university
                               // 8 - group AI
                               // 9 - group AI Archive
                               // 10 - group AI Academig Admin
  @Input() showEditBtn: boolean;
  @Input() stream: number;
  @Input() streamFollow: number;
  @Input() streamSuggestion: number = 0;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @ViewChild('toggleShareModal', { static: true }) toggleShare: ElementRef;

  shareFlag: boolean = false;
  url: any;

  constructor(public userService: UserService,
              private sanitizer: DomSanitizer,
              private sharedService: SharedService) { }

  ngOnInit() {
    if (this.outreach.clip) {
      const linkConvert: string = this.sharedService.convertMedia(this.outreach.clip);
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(linkConvert);
    }
  }

  buttonEditFunc(): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(): void {
    this.buttonDeleteClick.emit(true);
  }

  buttonSuggestionFunc(i: number) {
    this.buttonSuggestionClick.emit(i);
  }

  openShareModalFunc() {
    this.shareFlag = true;
  }

  closeShareModalFunc() {
    this.toggleShare.nativeElement.click();
    this.shareFlag = false;
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
