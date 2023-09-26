import {Component, Input, OnInit, EventEmitter} from '@angular/core';
import {FormGroup, FormArray, FormControl} from '@angular/forms';

import {Referee} from '../../../services/position-service';

function idValidator(control: FormControl): {[key: string]: any} {
  const value: string = (control.value ? control.value._id : '') || '';
  const valid = value;
  return valid ? null : {ssn: true};
}

@Component({
  selector: 'build-referees',
  templateUrl: 'build-referees.html',
  styleUrls: ['build-referees.css']
})
export class PositionBuildRefereesComponent implements OnInit {
  @Input() numReferees: number;
  @Input() referees: Referee[];

  @Input() status: number;

  @Input() parentGroup: FormGroup;
  @Input() controlName: string;

  @Input() submitStatus: boolean = false;

  // existIds: string[] = [];
  // existIdsFill: string[];

  ngOnInit() {
    // console.log('referees',this.referees)

    this.parentGroup.addControl(this.controlName,new FormArray([]));

    if (this.status<10) {
      for (let _i = 0; _i < this.numReferees; _i++) this.addReferee(null);
    } else if (this.status>9 && this.referees) {
      this.referees.forEach((referee) => this.addReferee(referee));
    }
  }

  addReferee(referee: Referee) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;

    // console.log('referee',referee)

    fieldNames.push(
      new FormGroup({
        member: new FormControl(referee ? referee.member : null), // idValidator
        email: new FormControl(referee ? referee.email: null),
        description: new FormControl(referee ? referee.description : null),
      })
    );

    // if (referee) this.existIds.push(referee.member._id);
    // this.existIdsFill = this.existIds.filter(r => r != '');
  }

  controlStatus(event, i: number) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;
    const fieldGroup = fieldNames.controls[i] as FormGroup;
    const _id = fieldGroup.value.member._id;

    // if (_id) { this.existIds[i] = _id; } else { this.existIds[i] = ''; }
    // this.existIdsFill = this.existIds.filter(r => r != '');

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
