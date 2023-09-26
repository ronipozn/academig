import {Component, Input, OnInit, EventEmitter} from '@angular/core';
import {FormGroup, FormArray, FormControl} from '@angular/forms';

import {fundingRole} from '../../../../services/funding-service';

function idValidator(control: FormControl): {[key: string]: any} {
  const value: string = (control.value ? control.value._id : '') || '';
  const valid = value;
  return valid ? null : {ssn: true};
}

@Component({
  selector: 'build-roles',
  templateUrl: 'build-roles.html',
  styleUrls: ['build-roles.css']
})
export class BuildFundingRolesComponent implements OnInit {
  @Input() newFlag: number;
  @Input() itemTitle: string;
  @Input() itemSmall: boolean = false;
  @Input() submitStatus: boolean = false;

  @Input() userId: string;
  @Input() fundingId: string;
  @Input() groupStage: number;

  @Input() parentGroup: FormGroup;
  @Input() controlName: string;

  @Input() roles: fundingRole[];

  rolesSelect = ['None',
                 'Principal Investigator',
                 'Coordinator',
                 'Speaker']

  existIds: string[] = [];
  existIdsFill: string[];

  ngOnInit() {
    this.parentGroup.addControl(this.controlName,
      new FormArray([
      ])
    );

    if (this.newFlag == 4) {

      this.addField(null);

    } else if (this.newFlag == 2 && this.roles) {

      this.roles.forEach((role) => {
        if (this.userId == role.member._id) { this.addField(role) }
      });

    }
  }

  addField(role: fundingRole) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;

    // console.log('role',role)

    fieldNames.push(
      new FormGroup({
        member: new FormControl(role ? role.member : null, idValidator),
        // email: new FormControl(role ? role.member: null),
        type: new FormControl(role ? role.type : 0),
        description: new FormControl(role ? role.description : null),
      })
    );

    if (role) this.existIds.push(role.member._id);

    this.existIdsFill = this.existIds.filter(r => r != '');
  }

  deleteField(i: number) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;
    fieldNames.removeAt(i);
    this.existIds[i] = '';
    this.existIdsFill = this.existIds.filter(r => r != '');
  }

  controlStatus(event, i: number) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;
    const fieldGroup = fieldNames.controls[i] as FormGroup;
    const _id = fieldGroup.value.member._id;

    if (_id) { this.existIds[i] = _id; } else { this.existIds[i] = ''; }
    this.existIdsFill = this.existIds.filter(r => r != '');

    // if (_id) {
    //   fieldGroup.controls['email'].setValue(fieldGroup.value.member.privateInfo.email);
    //   fieldGroup.controls['email'].disable();
    // } else {
    //   fieldGroup.controls['email'].setValue('');
    //   fieldGroup.controls['email'].enable();
    // }
  }

  getControls(FormGroup) {
    return FormGroup.get(this.controlName).controls
  }

}
