import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

import {GroupSize, GroupService} from '../../../shared/services/group-service';
import {Departments} from '../../../shared/services/university-service';

@Component({
  selector: 'group-info',
  templateUrl: 'group-info.html',
  styleUrls: ['group-info.css']
})
export class GroupInfoComponent implements OnInit {
  @Input() parentGroup: FormGroup;
  @Input() submitStatus: boolean;
  @Input() invalid: string[] = [];
  @Input() topics: string[] = [];

  errorFlag: boolean[] = [false, false, false, false];

  universityId: string = null;
  departmentId: string = null;
  existFlag = false;
  searching = false;

  groupSize = GroupSize;
  acronym: string;

  topicSelections: string[];

  departments = Departments;
  formatter = (x: {name: string}) => x.name;
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.departments.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20))
    )

  constructor(public groupService: GroupService) { }

  async ngOnInit() {
    this.keyUp(2);
  }

  async keyUp(i: number) {
    const universityField = this.parentGroup.get('university').value;
    const departmentField = this.parentGroup.get('department').value;
    const groupField = this.parentGroup.get('group').value;

    if ((i == 0 || i == 2)) {
      this.universityId = universityField ? universityField.academigId : null;
      this.errorFlag[0] = false;
    }

    if (i == 1 || i == 2) {
      this.departmentId = departmentField ? departmentField._id : null;
      if (this.departmentId) this.errorFlag[1] = false;
    }

    if (groupField) {
      this.errorFlag[3] = false;
      this.searching = false;
      this.existFlag = await this.groupService.groupExist(this.universityId, this.departmentId, groupField);
      this.searching = true;

      const groupName = this.parentGroup.get('group').value;
      const matches = groupName.match(/\b(\w)/g);
      this.acronym = matches.join('').substring(0, 2).toUpperCase();
    }
  }

  // https://stackoverflow.com/questions/51147864/how-to-limit-angular-material-multiple-select-items-to-n-items
  topicsChanged() {
    if (this.parentGroup.get('topic').value.length < 6) {
      this.topicSelections = this.parentGroup.get('topic').value;
    } else {
      this.parentGroup.get('topic').setValue(this.topicSelections);
    }
  }

  // toStep(): void {
  //   this.errorFlag = [false, false, false, false];
  //
  //   if (this.parentGroup.get('university').invalid) this.errorFlag[0] = true;
  //   if (this.parentGroup.get('department').invalid) this.errorFlag[1] = true;
  //   if (this.parentGroup.get('group').invalid || this.existFlag) this.errorFlag[3] = true;
  //
  //   if (this.errorFlag[0]==false && this.errorFlag[1]==false && this.errorFlag[3]==false) {
  //     if (this.parentGroup.get('university').value.name == null) {
  //       this.parentGroup.get('university').setValue({'_id': '0', 'name': this.universityField, 'pic': ''})
  //       if (this.parentGroup.get('department').value.name == null) {
  //         this.parentGroup.get('department').setValue({'_id': '0', 'name': this.departmentField, 'pic': ''})
  //       };
  //     };
  //   }
  // }

}
