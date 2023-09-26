import {Component, Input, Output, EventEmitter} from '@angular/core';

import {FAQ} from '../../../shared/services/faq-service';

@Component({
  selector: 'faq-item',
  templateUrl: 'faq-item.html',
  styleUrls: ['faq-item.css'],
})
export class FAQItemComponent {
  @Input() sourceType: number = 0; // 0 - group
                                   // 1 - group AI
  @Input() faq: FAQ;
  @Input() showEditBtn: number;
  @Input() i: number;
  @Input() stream: number;

  @Input() streamSuggestion: number = 0;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  buttonEditFunc() {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc() {
    this.buttonDeleteClick.emit(true);
  }

  buttonSuggestionFunc(i: number) {
    this.buttonSuggestionClick.emit(i);
  }

  animationDone() {
    this.animationDoneEvent.emit(true);
  }

}
