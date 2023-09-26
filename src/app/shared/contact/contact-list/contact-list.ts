import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Contact} from '../../services/contact-service';

@Component({
  selector: 'contact-list',
  templateUrl: 'contact-list.html'
})
export class ContactListComponent {
  @Input() sourceType: number;
  @Input() contacts: Contact[] = [];
  @Input() userId: string;
  @Input() showEditBtn: number;
  @Input() itemFocus: number;
  @Input() bagName: string;

  @Input() streamRetrieved: boolean;
  @Input() stream: number[];
  @Input() streamSuggestion: number[];

  @Output() buttonEditClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number[]> = new EventEmitter()

  @Output() buttonMessageClick: EventEmitter <number> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  buttonEditFunc(index: number): void {
    this.buttonEditClick.emit(index);
  }

  buttonDeleteFunc(index: number): void {
    this.buttonDeleteClick.emit(index);
  }

  bottonMessageFunc(index: number): void {
    this.buttonMessageClick.emit(index);
  }

  buttonSuggestionFunc(action: number, index: number): void {
    this.buttonSuggestionClick.emit([index, action]);
  }

  animationDone(): void {
    this.animationDoneEvent.emit(true);
  }

}
