import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

import {GroupSize, CompanySize, GroupService} from '../../../shared/services/group-service';
import {Countries} from '../../../shared/services/shared-service';
import {Departments, departmentsItems} from '../../../shared/services/university-service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'signup-build-group-info',
  templateUrl: 'group-info.html',
  styleUrls: ['group-info.css']
})
export class SignUpBuildGroupInfoComponent implements OnInit {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;
  @Input() companyItems: departmentsItems;
  @Input() marketingFromDepartmentFlag: boolean = false;
  @Input() topics: string[] = [];

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();
  @Output() skipLabStep: EventEmitter <boolean> = new EventEmitter();

  errorFlag: boolean[] = [false, false, false, false];

  universityId: string = null;
  departmentId: string = null;

  detailsFlag: boolean = false;
  existFlag: boolean = false;
  searching: boolean = false;

  universityField;
  departmentField;
  groupField;

  labType: number;
  fromPositionFlag: boolean = false;

  departments = Departments;
  countries = Countries;
  groupSize = GroupSize;
  companySize = CompanySize;

  topicSelections: string[];

  formatter = (x: {name: string}) => x.name;

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.departments.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20))
    )

  constructor(public groupService: GroupService) { }

  ngOnInit() {
    this.labType = (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) ? 1 : 0;
    this.fromPositionFlag = (this.forkNum==3 || this.forkNum==5);
    this.keyUp(2);
  }

  async keyUp(i: number) {
    this.universityField = (this.labType==1) ? { "academigId": environment.companyId, "name": "company" } : this.parentGroup.get('university').value;

    this.departmentField = this.parentGroup.get('department').value;

    this.groupField = this.parentGroup.get('group').value;

    if ((i==0 || i==2)) {
      this.universityId = this.universityField ? this.universityField.academigId : null;
      this.errorFlag[0] = false;
    }

    if ((i==1 || i==2) && this.labType==0) {
      this.departmentId = this.departmentField ? this.departmentField._id : null;
      // if (this.departmentId) 
      this.errorFlag[1] = false;
    }

    if (this.groupField) {
      this.errorFlag[3] = false;
      this.searching = false;

      this.existFlag = await this.groupService.groupExist(this.universityId, this.departmentId, this.groupField);
      this.searching = true;
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

  companyField() {
    let fieldIndex = this.parentGroup.get('department').value;
    this.departmentId = this.companyItems[fieldIndex]._id;
    if (this.departmentId) this.errorFlag[1] = false;
  }

  detailsFunc() {
    this.parentGroup.get('allowDetails').setValue(true);
  }

  toStep(): void {
    this.errorFlag = [false, false, false, false];

    if (this.parentGroup.get('university').invalid && this.labType==0 && !this.marketingFromDepartmentFlag && !this.fromPositionFlag) {
      this.errorFlag[0] = true;
    }

    if (!this.marketingFromDepartmentFlag && !this.fromPositionFlag &&
        (this.parentGroup.get('department').invalid && this.labType==0) ||
        (this.parentGroup.get('department').value==null && this.labType==1)
       ) {
      this.errorFlag[1] = true;
    }

    if (this.parentGroup.get('group').invalid || this.existFlag) {
      this.errorFlag[3] = true;
    }

    if (this.errorFlag[0]==false && this.errorFlag[1]==false && this.errorFlag[3]==false) {

      if (this.labType==1) {

        this.parentGroup.get('university').setValue({'_id': environment.companyId, 'name': 'company', 'pic': ''})

      } else {

        // console.log('this.departmentField',this.departmentField)

        if (this.parentGroup.get('university').value.name==null) this.parentGroup.get('university').setValue({'_id': '0', 'name': this.universityField, 'pic': ''})
        if (this.parentGroup.get('department').value.name==null) this.parentGroup.get('department').setValue({'_id': '0', 'name': this.departmentField, 'pic': ''})

      }

      this.newStep.emit([]);

    }
  }

  toLabSkip(): void {
    this.skipLabStep.emit();
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
