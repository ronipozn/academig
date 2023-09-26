import {Component, Input, Output, OnChanges, EventEmitter} from '@angular/core';

@Component({
  selector: '[build-pic]',
  templateUrl: 'build-pic.html',
  styleUrls: ['build-pic.css']
})
export class GroupBuildPicComponent {
  @Input() pic: string;

  @Input() altText: string;
  @Input() titleText: string;
  @Input() bodyText: string;

  @Input() showEditBtn: boolean;
  @Input() widthFlag: boolean = true;
  @Input() leftFlag: boolean = false;
  @Input() hoverFlag: boolean = true;
  @Input() deleteFlag: boolean = true;
  @Input() fluidFlag: boolean = false;

  @Input() width: number;
  @Input() height: number;

  @Input() type = 0; // 0 - Cover pic
                     // 1 - Gallery pic
                     // 2 - Gallery album
                     // 3 - Carousel
                     // 4 - Figure

  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();

  btnFlag: boolean;

  imgOver(showStatus: boolean) {
    if (this.showEditBtn) {
      this.btnFlag = showStatus;
    }
  }

  buttonEditFunc(event): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(event): void {
    this.buttonDeleteClick.emit(true);
  }

}
