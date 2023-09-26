import {Component, Input, OnInit, OnChanges, Output, EventEmitter} from '@angular/core';
import {Comment} from '../../services/news-service';

import {objectMini} from '../../services/shared-service';

import * as moment from 'moment';

@Component({
  selector: '[comment-item]',
  templateUrl: 'comment-item.html'
})
export class CommentItemComponent implements OnInit {
  @Input() news: Comment;
  @Input() userId: string;
  @Input() commentors: objectMini[];
  @Input() user: objectMini;
  // @Input() stream: number;
  // @Input() streamComments: number[];

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  editFlag = false;
  commentor: objectMini;

  ngOnInit() {
    this.editFlag = (this.userId == this.news.user_id)
    this.commentor = [this.user].concat(this.commentors).find(x => x._id === this.news.user_id);
    // console.log('this.commentor',this.commentor)
  }

  buttonEditFunc() {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc() {
    this.buttonDeleteClick.emit(true);
  }

  animationDone() {
    this.animationDoneEvent.emit(true);
  }

}
