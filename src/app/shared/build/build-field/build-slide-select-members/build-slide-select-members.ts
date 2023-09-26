import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, FormArray, Validators, AbstractControl} from '@angular/forms';

import {PeopleService} from '../../../services/people-service';
import {objectMini} from '../../../services/shared-service';

@Component({
  selector: 'build-slide-select-members',
  templateUrl: 'build-slide-select-members.html',
  styleUrls: ['build-slide-select-members.css']
})
export class BuildSlideSelectMembersComponent implements OnInit {
  @Output() membersOutput: EventEmitter <objectMini[]> = new EventEmitter(true);
  @Output() controlStatus: EventEmitter <boolean> = new EventEmitter(true);

  @Input() itemSmall: boolean;
  @Input() labelHide = false;
  @Input() itemFirst = false;
  @Input() selectAllFlag = false;

  @Input() labelRequired = false;
  @Input() minSelected = 0; // minimum selected

  @Input() groupId: string;
  @Input() userId: string;
  @Input() title: string;
  @Input() single = false;
  @Input() mode = false; // false - all members
                                  // true - filter out userId
  @Input() type = 3; // 0 - Alumni
                             // 1 - Visitor
                             // 2 - Alumni
                             // 3 - Active and Alumni

  @Input() preMembersInput: objectMini[];
  @Input() controlName: string;
  @Input() parentGroup: FormGroup;

  @Input() set submitStatus(value: boolean) {
     this._controlStatus = value;
     this.changeStatus(this._controlStatus);
  }

  get submitStatus(): boolean {
      return this._controlStatus;
  }

  members: objectMini[] = [];
  streamRetrieved: boolean;
  picHover: string = null;
  radioChecked = -1;

  _controlStatus: boolean;
  _ignite = false;

  constructor(private peopleService: PeopleService) {}

  changeStatus(a: boolean) {
    if (this._ignite == false) {
      this._ignite = true;
    } else {
      this._controlStatus = true
      this.controlStatus.emit(true);
    }
  }

  ngOnInit() {
    this.streamRetrieved = false;

    this.parentGroup.addControl(this.controlName,
      new FormArray([ new FormControl() ], this.minLengthArray(this.minSelected)),
    );

    this.peoplesFunc()
  }

  minLengthArray(min: number) {
      return (c: AbstractControl): {[key: string]: any} => {
        const len = c.value.reduce(function(a, b) {return b ? a + 1 : a; }, 0);
        if (len>=min) { return null; } // if (c.value.length >= min)
        return { 'minLengthArray': {valid: false }};
      }
  }

  picHoverFunc(i: number): void {
    this.picHover = (i == -1) ? null : '(' + this.members[i].name + ')'
  }

  selectAllFunc(): void {
    const membersForm = this.parentGroup.get(this.controlName) as FormArray;

    for (let _j = 0; _j < this.members.length; _j++) {
      (<FormArray>this.parentGroup.controls[this.controlName])
        .at(_j).setValue(true);
    }
  }

  async peoplesFunc() {
    this.members = await this.peopleService.getPeoples(1, this.groupId, null, this.type, 2);

    if (this.mode) this.members = this.members.filter(r => r._id != this.userId);

    this.membersOutput.emit(this.members);

    if (this.single == false) {

      const membersForm = this.parentGroup.get(this.controlName) as FormArray;
      for (let _j = 0; _j < this.members.length; _j++) {

        if (_j > 0) { membersForm.push(new FormControl()); }

        (<FormArray>this.parentGroup.controls[this.controlName])
          .at(_j)
          .setValue(
            (this.preMembersInput[0] == null) ? false :
              (this.preMembersInput.find(p => p._id === this.members[_j]._id) ? true : false)
          );
      }

    } else {

       this.radioChecked = (this.preMembersInput[0] == null) ? -1 :
                            this.members.findIndex(p => p._id === this.preMembersInput[0]._id);

       (<FormArray>this.parentGroup.controls[this.controlName])
         .at(0)
         .setValue(this.radioChecked)

    }

    this.streamRetrieved = true;
  }

}
