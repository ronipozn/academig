import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: '[build-text]',
  templateUrl: 'build-text.html',
  styleUrls: ['build-text.css']
})
export class GroupBuildTextComponent {
  @Input() text: string;
  @Input() textMax: number = 0;

  @Input() showEditBtn: boolean;
  @Input() stream: number;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  toggleFlag = false;

  buttonEditFunc() {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc() {
    this.buttonDeleteClick.emit(true);
  }

  animationDone() {
    this.animationDoneEvent.emit(true);
  }

  toggleAbstract() {
    this.toggleFlag = !this.toggleFlag;
  }

}
