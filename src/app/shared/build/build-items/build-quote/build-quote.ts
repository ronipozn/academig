import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: '[build-quote]',
  templateUrl: 'build-quote.html',
  styleUrls: ['build-quote.css'],
})
export class QuoteComponent {
  @Input() text: string;
  @Input() name: string;
  @Input() pic: string;
  @Input() showEditBtn: number;
  @Input() stream: number;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  buttonEditFunc() {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc() {
    this.buttonDeleteClick.emit(true);
  }

  animationDone() {
    this.animationDoneEvent.emit(true);
  }

}
