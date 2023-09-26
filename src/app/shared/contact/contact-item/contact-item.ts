import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {Contact} from '../../services/contact-service';

@Component({
  selector: 'contact-item',
  templateUrl: 'contact-item.html',
  styleUrls: ['contact-item.css']
})
export class ContactItemComponent implements OnInit {
  @Input() sourceType: number = 0; // 0 - group / profile ...
                                   // 1 - group AI
  @Input() contact: Contact;
  @Input() userId: string;
  @Input() showEditBtn: number;
  @Input() itemNew: boolean;
  @Input() stream: number;

  @Input() streamSuggestion: number = 0;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number> = new EventEmitter();

  @Output() buttonMessageClick: EventEmitter <boolean> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  colorNum: number;

  colorPallete: string[] = ['5E5770', '889BA2', 'F7CBB6', 'CAE8A2', 'D4F3E9'];

  titleSelect = [
                 'General Contact',
                 'Secretary',
                 'Student Lab',
                 'PI Room',
                 'Student Room',
                ];

  ngOnInit() {
    this.colorNum = getRandomInt(0, 4);
  }


  buttonEditFunc() {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc() {
    this.buttonDeleteClick.emit(true);
  }

  buttonSuggestionFunc(i: number) {
    this.buttonSuggestionClick.emit(i);
  }

  buttonMessageFunc() {
    this.buttonMessageClick.emit(true);
  }

  animationDone() {
    this.animationDoneEvent.emit(true);
  }

}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
}
