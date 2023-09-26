import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

import * as moment from 'moment';

import {privateNews} from '../../../shared/services/private-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: '[private-news-item]',
  templateUrl: 'news-item.html',
  styleUrls: ['news-item.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PrivateNewsItemComponent implements OnInit {
  @Input() news: privateNews;
  @Input() sourceType: number; // 0 - regular, 1 - wall, 2 - comment
  @Input() userId: string;
  @Input() userStatus: number;
  @Input() stream: number;
  @Input() streamComments: number[];

  @Output() buttonCommentClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonEditCommentClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteCommentClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonShowCommentsClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  deadlineApproaching: boolean;
  editFlag = false;
  showButton = false;

  ngOnInit() {
    this.editFlag = (this.userStatus == 6) || (this.userStatus >= 4 && this.userId == this.news.actor._id)
  }

  buttonOver(showStatus: boolean): void {
    if (this.editFlag) {
      this.showButton = showStatus;
    }
  }

  buttonCommentFunc(event): void {
    this.buttonCommentClick.emit(true);
  }

  buttonEditCommentFunc(i: number): void {
    this.buttonEditCommentClick.emit(i);
  }

  buttonDeleteCommentFunc(i: number): void {
    this.buttonDeleteCommentClick.emit(i);
  }

  buttonShowCommentsFunc(event): void {
    this.buttonShowCommentsClick.emit(true);
  }

  buttonEditFunc(event): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(event): void {
    this.buttonDeleteClick.emit(true);
  }

  animationDone(event): void {
    this.showButton = false;
    this.animationDoneEvent.emit(true);
  }

}
