import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'build-buttons',
  templateUrl: 'build-buttons.html',
  styleUrls: ['build-buttons.css']
})
export class GroupBuildButtonComponent {
  @Input() showButton: boolean;

  @Input() editFlag = false; // only edit, no delete
  @Input() deleteFlag = false; // only delete, no edit

  @Input() editText: string = null;
  @Input() deleteText: string = null;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();

  buttonEditFunc(): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(): void {
    this.buttonDeleteClick.emit(true);
  }

}
