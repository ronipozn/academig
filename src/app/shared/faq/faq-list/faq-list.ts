import {Component, Input, Output, EventEmitter} from '@angular/core';

import {FAQ} from '../../../shared/services/faq-service';

@Component({
  selector: 'faq-list',
  templateUrl: 'faq-list.html'
})
export class FAQListComponent {
  @Input() sourceType: number = 0;
  @Input() faqs: FAQ[];
  @Input() showEditBtn: number;
  @Input() bagName: string;
  @Input() itemFocus: number;

  @Input() stream: number[];
  @Input() streamSuggestion: number[];

  @Output() buttonEditClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number[]> = new EventEmitter()

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  showButton: boolean;

  buttonEditFunc(index: number): void {
    this.buttonEditClick.emit(index);
  }

  buttonDeleteFunc(index: number): void {
    this.buttonDeleteClick.emit(index);
  }

  buttonSuggestionFunc(action: number, index: number): void {
    this.buttonSuggestionClick.emit([index, action]);
  }

  animationDone(): void {
    this.animationDoneEvent.emit(true);
  }

}
