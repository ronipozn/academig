import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: '[build-badge]',
  templateUrl: 'build-badge.html',
  styleUrls: ['build-badge.css'],
})
export class GroupBuildBadgeComponent {
  @Input() badges: string[];
  @Input() showEditBtn: number;
  @Input() stream: number;
  @Input() mode: number = 0;

  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonTagClick: EventEmitter <number> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  buttonDelete() {
    this.buttonDeleteClick.emit(true);
  }

  buttonEdit() {
    this.buttonEditClick.emit(true);
  }

  tagClick(i: number) {
    this.buttonTagClick.emit(i);
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
