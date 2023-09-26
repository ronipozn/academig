import {Component, Input, Output, OnInit, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Teaching} from '../../services/teaching-service';

import {trigger, state, style, animate, transition, keyframes} from '@angular/animations';

import {itemsAnimation} from '../../animations/index';
import {UserService} from '../../../user/services/user-service';

@Component({
  selector: 'teaching-item',
  templateUrl: 'teaching-item.html',
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' },
})
export class TeachingItemComponent implements OnInit {
  @Input() teaching: Teaching;
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
  // @Output() buttonFollowClick: EventEmitter <boolean> = new EventEmitter();
  // @Output() buttonMoveClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @ViewChild('toggleShareModal', { static: true }) toggleShare: ElementRef;

  colorNum: number;
  shareFlag = false;

  colorPallete: string[] = ['5E5770', '889BA2', 'F7CBB6', 'CAE8A2', 'D4F3E9'];

  constructor(public userService: UserService) { }

  ngOnInit() {
    this.colorNum = getRandomInt(0, 4);
  }

  buttonEditFunc(event): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(event): void {
    this.buttonDeleteClick.emit(true);
  }

  // buttonFollowFunc(event): void {
  //   this.buttonFollowClick.emit(true);
  // }

  // buttonMoveFunc(): void {
  //   this.buttonMoveClick.emit(true);
  // }

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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
}
