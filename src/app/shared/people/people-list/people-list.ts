import {Component, Input, Output, EventEmitter, HostListener} from '@angular/core';
import {People, PeopleService} from '../../services/people-service';

@Component({
  selector: 'people-list',
  templateUrl: 'people-list.html',

})
export class PeopleListComponent {
  @Input() streamRetrieved: boolean;
  @Input() peoples: People[] = [];
  @Input() sourceType: number;
  @Input() showEditBtn: boolean;
  @Input() groupStage: number;
  @Input() itemFocus: number;
  @Input() follows: boolean[];
  @Input() stream: number[];
  @Input() streamFollow: number[];
  @Input() activeId: string;

  @Output() btnAddClick: EventEmitter <number> = new EventEmitter();
  @Output() btnMainEditClick: EventEmitter <number> = new EventEmitter();
  @Output() btnEditClick: EventEmitter <[number, number]> = new EventEmitter();
  @Output() btnDeleteClick: EventEmitter <[number, number]> = new EventEmitter();
  @Output() btnEndClick: EventEmitter <[number, number]> = new EventEmitter();
  @Output() btnAcceptClick: EventEmitter <number> = new EventEmitter();
  @Output() btnDeclineClick: EventEmitter <number> = new EventEmitter();
  @Output() btnResendClick: EventEmitter <number> = new EventEmitter();
  @Output() btnCancelClick: EventEmitter <number> = new EventEmitter();
  @Output() btnFollowClick: EventEmitter <number> = new EventEmitter();
  @Output() btnMessageClick: EventEmitter <number> = new EventEmitter();
  @Output() btnEmailClick: EventEmitter <number> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  isMobile: boolean;

  // sourceType:
  // 0 - actives
  // 1 - project collaborators
  // 2 - visitors
  // 3 - alumni
  // 4 - following page
  // 5 - search
  // 6 - profile
  // 7 - dummy co-authors page
  // 8 - sidebar
  // 9 - Department
  // 10 - University
  // 11 - "Cloud" (University, Department)
  // 12 - Company

  constructor(private peopleService: PeopleService) {
    this.isMobile = (window.innerWidth < 768);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = (window.innerWidth < 768);
  }

  btnAddFunc(event, index: number): void {
    this.btnAddClick.emit(index);
  }

  btnMainEditFunc(event, index: number): void {
    this.btnMainEditClick.emit(index);
  }

  btnEditFunc(event, index: number): void {
    this.btnEditClick.emit([index, event]);
  }

  btnDeleteFunc(event, index: number): void {
    this.btnDeleteClick.emit([index, event]);
  }

  btnEndFunc(event, index: number): void {
    this.btnEndClick.emit([index, event]);
  }

  btnAcceptFunc(event, index: number): void {
    this.btnAcceptClick.emit(index);
  }

  btnDeclineFunc(event, index: number): void {
    this.btnDeclineClick.emit(index);
  }

  btnResendFunc(event, index: number): void {
    this.btnResendClick.emit(index);
  }

  btnCancelFunc(event, index: number): void {
    this.btnCancelClick.emit(index);
  }

  btnFollowFunc(event, index: number): void {
    this.btnFollowClick.emit(index);
  }

  btnMessageFunc(event, index: number): void {
    this.btnMessageClick.emit(index);
  }

  btnEmailFunc(event, index: number): void {
    this.btnEmailClick.emit(index);
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
