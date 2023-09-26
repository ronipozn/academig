import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Press, MediaService} from '../../services/media-service';

@Component({
  selector: 'media-press-item',
  templateUrl: 'press-item.html',
  styleUrls: ['press-item.css']
})
export class MediaPressItemComponent {
  @Input() press: Press;
  @Input() sourceType: number; // 0 - group
                               // 1 - profile
                               // 2 - project
                               // 3 - department
                               // 4 - university
                               // 5 - group AI
  @Input() showEditBtn: boolean;
  @Input() stream: number;

  @Input() streamSuggestion: number = 0;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();

  @Output() buttonAcceptClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonRejectClick: EventEmitter <boolean> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  // dragFlag = false;
  // this.dragFlag = this.sourceType == 0 && showStatus && this.stream == 0;

  buttonEditFunc(event): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(event): void {
    this.buttonDeleteClick.emit(true);
  }

  buttonAccpetFunc() {
    this.buttonAcceptClick.emit(true);
  }

  buttonRejectFunc() {
    this.buttonRejectClick.emit(true);
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
