import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'build-headline',
  templateUrl: 'build-headline.html',
  styleUrls: ['build-headline.css']
})
export class GroupBuildHeadlineComponent {
  @Input() showEditBtn: boolean;
  @Input() undoBtnFlag = false;
  @Input() redoBtnFlag = false;
  @Input() addButtonFlag = false;
  @Input() headline: string;
  @Input() headlineStyle: number = 0;

  @Input() icon: string = "add_circle";
  @Input() tooltip: string = "Add";

  @Output() buttonUndoClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonAddClick: EventEmitter <boolean> = new EventEmitter();

  btnUndoFunc(event): void {
    this.buttonUndoClick.emit(true);
  }

  btnAddFunc(event): void {
    this.buttonAddClick.emit(true);
  }

}
