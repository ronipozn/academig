import {Component, Input, Output, EventEmitter} from '@angular/core';

import {Topic} from '../../../shared/services/project-service';

@Component({
  selector: 'topic-item',
  templateUrl: 'topic-item.html',
  styleUrls: ['topic-item.css'],
})
export class TopicItemComponent {
  @Input() topic: Topic;
  @Input() showEditBtn: number;
  @Input() i: number;
  @Input() stream: number;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  buttonEditFunc(event): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(event): void {
    this.buttonDeleteClick.emit(true);
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
