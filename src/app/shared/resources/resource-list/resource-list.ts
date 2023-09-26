import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Resource} from '../../services/resource-service';

@Component({
  selector: 'resource-list',
  templateUrl: 'resource-list.html'
})
export class ResourceListComponent {
  @Input() resources: Resource[] = [];
  @Input() sourceType: number;
  @Input() itemFocus: number;
  @Input() showEditBtn: number;
  @Input() planNumber = 2;
  @Input() bagName: string;

  @Input() follows: boolean[];
  @Input() streamRetrieved: boolean;
  @Input() stream: number[];
  @Input() streamFollow: number[];
  @Input() streamSuggestion: number[];

  @Input() deleteFlag = false;

  @Output() buttonEditClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number[]> = new EventEmitter()

  @Output() buttonFollowClick: EventEmitter <number> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  buttonEditFunc(index: number): void {
    this.buttonEditClick.emit(index);
  }

  buttonDeleteFunc(index: number): void {
    this.buttonDeleteClick.emit(index);
  }

  buttonFollowFunc(index: number): void {
    this.buttonFollowClick.emit(index);
  }

  buttonSuggestionFunc(action: number, index: number): void {
    this.buttonSuggestionClick.emit([index, action]);
  }

  animationDone(): void {
    this.animationDoneEvent.emit(true);
  }

}
