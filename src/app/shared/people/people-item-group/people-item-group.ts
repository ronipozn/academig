import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {Position, People, titlesTypes} from '../../services/people-service';

@Component({
  selector: 'people-item-group',
  templateUrl: 'people-item-group.html',
  styleUrls: ['people-item-group.css'],
})
export class PeopleItemGroupComponent implements OnInit {
  @Input() people: People;
  @Input() sourceType: number;
  @Input() showEditBtn: boolean;
  @Input() groupStage: number;
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
  @Output() btnEmailClick: EventEmitter <boolean> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  showButton: boolean;
  titlesSelect = titlesTypes;

  // showPositionButton: boolean[];
  // lastPosition: Position;

  ngOnInit() {
    // this.lastPosition = this.people.positions[this.people.positions.length-1];
    // this.showPositionButton=new Array(this.people.positions.length).fill(0);
  }

  buttonOver(showStatus: boolean) {
    if (this.showEditBtn || this.people._id==this.activeId) {
      this.showButton = showStatus;
    }
  }

  // positionButtonOver(showStatus: boolean, i: number) {
  //   if (this.showEditBtn || this.people._id==this.activeId) {
  //     this.showPositionButton[i]=showStatus;
  //   }
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

  btnAcceptFunc() {
    this.btnAcceptClick.emit(true);
  }

  btnDeclineFunc() {
    this.btnDeclineClick.emit(true);
  }

  btnResendFunc() {
    this.btnResendClick.emit(true);
  }

  btnCancelFunc() {
    this.btnCancelClick.emit(true);
  }

  btnFollowFunc() {
    this.btnFollowClick.emit(true);
  }

  btnMessageFunc() {
    this.btnMessageClick.emit(true);
  }

  btnEmailFunc() {
    this.btnEmailClick.emit(true);
  }

  animationDone() {
    // this.showButton=false;
    this.animationDoneEvent.emit(true);
  }

}
