import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'people-build-buttons',
  templateUrl: 'people-build-buttons.html',
  styleUrls: ['people-build-buttons.css']
})
export class PeopleBuildButtonComponent {
  @Input() showButton: boolean;

  @Input() addFlag = false;
  @Input() editFlag = false; // only edit, no delete
  @Input() deleteFlag = false; // only delete, no edit
  @Input() endFlag = false;

  @Input() addText: string = null;
  @Input() editText: string = null;
  @Input() deleteText: string = null;
  @Input() endText: string = null;

  @Output() buttonAddClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonEndClick: EventEmitter <boolean> = new EventEmitter();

  buttonAddFunc(event): void {
    this.buttonAddClick.emit(true);
  }

  buttonEditFunc(event): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(event): void {
    this.buttonDeleteClick.emit(true);
  }

  buttonEndFunc(event): void {
    this.buttonEndClick.emit(true);
  }

}
