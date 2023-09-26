import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';

import {Funding, fundingRole} from '../../services/funding-service';
import {groupComplex} from '../../services/shared-service';

@Component({
  selector: 'funding-item',
  templateUrl: 'funding-item.html',
  styleUrls: ['funding-item.css']
})
export class FundingItemComponent implements OnInit {
  @Input() funding: Funding;
  @Input() activeId: string;
  @Input() groupStage: number;
  @Input() sourceType: number; // 0 - group
                               // 1 - project
                               // 2 - profile
                               // 3 - group AI
                               // 4 - group AI Archive
                               // 5 - group AI Academig Admin
  @Input() showEditBtn: number;
  @Input() stream: number;
  @Input() streamRole: number[];
  @Input() userGroups: groupComplex[];

  @Input() streamSuggestion: number = 0;

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number> = new EventEmitter();

  // Pay attention that ID is emitted here and not the index
  @Output() buttonGroupAddClick: EventEmitter <string> = new EventEmitter();
  @Output() buttonGroupDeleteClick: EventEmitter <string> = new EventEmitter();

  @Output() buttonRoleAddClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonRoleApproveClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonRoleDeclineClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonRoleEditClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonRoleLeaveClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonRoleDeleteClick: EventEmitter <number> = new EventEmitter();

  // currencySelect = ['Dollar', 'Euro', 'Pound', 'Shekel', 'Won', 'Ruble', 'Rupee', 'Yen', 'Yuan'];
  // currencySymbols = ['usd', 'eur', 'gbp', 'ils', 'krw', 'rub', 'inr', 'jpy', 'jpy'];
  currencySymbols = ['$', '€', '£', '₪', '₩', '₽', '₹', '¥', '元'];

  singleFlag = false;

  showAddButton: boolean[];
  showMinusButton: boolean[];

  colorPallete: string[] = ['5E5770', '889BA2', 'F7CBB6', 'CAE8A2', 'D4F3E9'];
  colorNum: number;

  groupFlag = false;

  userGroupsFiltered: groupComplex[];

  fundingGroupsIds: string[];
  userGroupsIdsInside: string[];

  ngOnInit() {
    this.colorNum = getRandomInt(0, 4);
    this.singleFlag = (this.funding.periods.length == 1);

    if (this.sourceType == 2) {
      this.updateGroupsList();
      this.showAddButton = new Array(this.userGroupsFiltered.length).fill(0);
      this.showMinusButton = new Array(this.fundingGroupsIds.length).fill(0);
    };

    const role: fundingRole = this.funding.roles.filter(r => r.member._id).filter(r => r.member._id == this.activeId)[0];

    if (role && role.status == 2) {
      this.groupFlag = true;
    };
  }

  addButtonOver(showStatus: boolean, i: number) {
    this.showAddButton[i] = showStatus;
  }

  minusButtonOver(showStatus: boolean, i: number) {
    if (this.sourceType == 2 && this.userGroupsIdsInside.indexOf(this.fundingGroupsIds[i]) > -1) {
      this.showMinusButton[i] = showStatus;
    }
  }

  buttonAddFunc(index: number) {
    this.buttonGroupAddClick.emit(this.userGroupsFiltered[index].group._id);
    this.funding.groups.push(this.userGroupsFiltered[index]);
    this.showAddButton[index] = false;
    this.updateGroupsList();
  }

  buttonMinusFunc(index: number) {
    this.buttonGroupDeleteClick.emit(this.funding.groups[index].group._id);
    this.funding.groups.splice(index, 1);
    this.showMinusButton[index] = false;
    this.updateGroupsList();
  }

  updateGroupsList() {
    if (this.funding.groups[0]) {
      // this Funding groups IDs
      this.fundingGroupsIds = this.funding.groups.map(r => r.group._id);

      // user groups that are not already part of this Funding item
      this.userGroupsFiltered = this.userGroups.filter(r => r.group.link!=null).filter(r => this.fundingGroupsIds.indexOf(r.group._id) == -1);

      // user groups IDs that are part of this Funding item
      this.userGroupsIdsInside = this.userGroups.filter(r => this.fundingGroupsIds.indexOf(r.group._id) > -1).map(r => r.group._id);
    } else {
      this.fundingGroupsIds = [];
      this.userGroupsFiltered = [];
      this.userGroupsIdsInside = [];
    }
  }

  buttonEditFunc(event): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(event): void {
    this.buttonDeleteClick.emit(true);
  }

  buttonRoleAddFunc(event): void {
    this.buttonRoleAddClick.emit(true);
  }

  buttonRoleApproveFunc(index: number): void {
    this.buttonRoleApproveClick.emit(index);
  }

  buttonRoleDeclineFunc(index: number): void {
    this.buttonRoleDeclineClick.emit(index);
  }

  buttonRoleEditFunc(index: number): void {
    this.buttonRoleEditClick.emit(index);
  }

  buttonRoleLeaveFunc(index: number): void {
    this.buttonRoleLeaveClick.emit(index);
  }

  // buttonRoleDeleteFunc(index: number): void{
  //   this.buttonRoleDeleteClick.emit(index);
  // }

  buttonSuggestionFunc(i: number) {
    this.buttonSuggestionClick.emit(i);
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
