import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Collaboration} from '../../../services/collaboration-service';

@Component({
  selector: 'collaboration-info',
  templateUrl: 'collaboration-info.html',
  styleUrls: ['collaboration-info.css']
})
export class CollaborationInfoComponent {
  @Input() collaboration: Collaboration;
  @Input() stream: number;

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
