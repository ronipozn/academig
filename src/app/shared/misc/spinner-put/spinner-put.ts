import {Component, Input, Output, EventEmitter} from '@angular/core';

// import {trigger, state, style, animate, transition, keyframes} from '@angular/animations';
import {okAnimation} from '../../animations/index';

@Component({
  selector: 'spinner-put',
  templateUrl: 'spinner-put.html',
  animations: [okAnimation],
  host: { '[@okAnimation]': '' },
})
export class SpinnerPutComponent {
  @Input() stream: number;

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
