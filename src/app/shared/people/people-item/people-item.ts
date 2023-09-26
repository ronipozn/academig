import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Position, People, titlesTypes} from '../../services/people-service';

@Component({
  selector: 'people-item',
  templateUrl: 'people-item.html',
  styleUrls: ['people-item.css'],
})
export class PeopleItemComponent {
  @Input() isMobile: boolean;
  @Input() sourceType: number;

  @Input() people: People;
  @Input() showEditBtn: boolean;
  @Input() groupStage: number;
  @Input() followStatus: boolean;
  @Input() stream: number;
  @Input() streamFollow: number;
  @Input() activeId: string;

  @Output() btnAddClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnMainEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnEditClick: EventEmitter <number> = new EventEmitter();
  @Output() btnDeleteClick: EventEmitter <number> = new EventEmitter();
  @Output() btnEndClick: EventEmitter <number> = new EventEmitter();
  @Output() btnAcceptClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnDeclineClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnResendClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnCancelClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnFollowClick: EventEmitter <boolean> = new EventEmitter();
  @Output() btnMessageClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  // showPositionButton: boolean[];

  // lastPosition: Position;
  titlesSelect = titlesTypes;

  // ngOnInit() {
  //   // console.log('people',this.people)
  //   // this.lastPosition = this.people.positions[this.people.positions.length-1];
  //   // this.showPositionButton=new Array(this.people.positions.length).fill(0);
  // }

  btnAddFunc(event) {
    this.btnAddClick.emit(true);
  }

  btnMainEditFunc(event) {
    this.btnMainEditClick.emit(true);
  }

  btnEditFunc(i: number) {
    this.btnEditClick.emit(i);
  }

  btnDeleteFunc(i: number) {
    this.btnDeleteClick.emit(i);
  }

  btnEndFunc(i: number) {
    this.btnEndClick.emit(i);
  }

  btnAcceptFunc(event) {
    this.btnAcceptClick.emit(true);
  }

  btnDeclineFunc(event) {
    this.btnDeclineClick.emit(true);
  }

  btnResendFunc(event) {
    this.btnResendClick.emit(true);
  }

  btnCancelFunc(event) {
    this.btnCancelClick.emit(true);
  }

  btnFollowFunc(event) {
    this.btnFollowClick.emit(true);
  }

  btnMessageFunc(event) {
    this.btnMessageClick.emit(true);
  }

  animationDone() {
    this.animationDoneEvent.emit(true);
  }

}
