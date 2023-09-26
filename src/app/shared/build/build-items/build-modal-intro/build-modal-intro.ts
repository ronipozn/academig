import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'build-modal-intro',
  templateUrl: 'build-modal-intro.html',
  styleUrls: ['build-modal-intro.css']
})
export class GroupBuildModalIntroComponent {
  @Input() headline: string;
  @Input() bodypic: string = null;
  @Input() bodytext: string = null;
  @Input() btntext: string = null;
  @Input() addButtonFlag = false;

  @Output() buttonAddClick: EventEmitter <boolean> = new EventEmitter();

  buttonClickFunc(event): void {
    this.buttonAddClick.emit(true);
  }

}
