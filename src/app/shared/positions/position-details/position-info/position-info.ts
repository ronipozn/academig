import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {OpenPositionDetails} from '../../../services/position-service';

import {itemsAnimation} from '../../../animations/index';

@Component({
  selector: 'position-info',
  templateUrl: 'position-info.html',
  styleUrls: ['position-info.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PositionInfoComponent {
  @Input() position: OpenPositionDetails;
  @Input() showEditBtn: boolean;

  @Input() streamLetters: number;
  @Input() streamDeadlines: number;
  @Input() streamText: number[];

  @Output() animationDone: EventEmitter <number> = new EventEmitter();
  @Output() animationTextDone: EventEmitter <number> = new EventEmitter();

  @Output() buttonLettersClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeadlinesClick: EventEmitter <boolean> = new EventEmitter();

  @Output() buttonTextDeleteClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonTextEditClick: EventEmitter <number> = new EventEmitter();

  lengthSelect = ['Months', 'Years'];
  currencySelect = ['Dollar', 'Euro', 'Pound', 'Shekel', 'Won', 'Ruble', 'Rupee', 'Yen', 'Yuan'];

  gradesTitles: string[] = ['GPA', 'GRE', 'TOEFL'];
  lettersTitles: string[] = ['Curriculum vitae', 'Letter of motivation', 'Letter of interest', 'Cover letter', 'Project proposal', 'Teaching statement'];

  constructor(private _router: Router,
              private activatedRoute: ActivatedRoute) {}

  // ngOnInit() {
  //   this.lettersFlag = this.position.lettersRequired ? this.position.lettersRequired.some(x => x == true) : false;
  // }

  lettersEdit() {
    this.buttonLettersClick.emit(true);
  }

  deadlinesEdit() {
    this.buttonDeadlinesClick.emit(true);
  }

  textDelete(type: number) {
    this.buttonTextDeleteClick.emit(type);
  }

  textEdit(type: number) {
    this.buttonTextEditClick.emit(type);
  }

  animationDoneFunc(type: number) {
    this.animationDone.emit(type);
  }

  animationTextDoneFunc(type: number) {
    this.animationTextDone.emit(type);
  }

}
