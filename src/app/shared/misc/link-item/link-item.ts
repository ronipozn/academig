import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Link} from '../../../shared/services/shared-service';

@Component({
  selector: 'link-item',
  templateUrl: 'link-item.html',
  styleUrls: ['link-item.css']
})
export class LinkItemComponent {
  @Input() link: Link;
  @Input() showEditBtn: boolean;
  @Input() stream: number;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  showButton: boolean;

  buttonOver(showStatus: boolean) {
    if (this.showEditBtn) {
      this.showButton = showStatus;
    }
  }

  buttonEditFunc(event): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(event): void {
    this.buttonDeleteClick.emit(true);
  }

  animationDone(event): void {
    this.showButton = false;
    this.animationDoneEvent.emit(true);
  }

}
