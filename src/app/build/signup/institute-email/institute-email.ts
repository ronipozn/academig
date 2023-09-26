import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {objectMiniPosition} from '../../../shared/services/shared-service';

@Component({
  selector: 'signup-build-institute-email',
  templateUrl: 'institute-email.html',
  styleUrls: ['institute-email.css']
})
export class SignUpBuildInstituteEmailComponent implements OnInit {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  errorFlag: boolean[] = [false, false, false];

  labType: number;
  labString: string[] = ['institutional', 'corporate']

  ngOnInit() {
    this.labType = (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) ? 1 : 0;
  }

  onClick(i: number): void {
    this.errorFlag[i] = false;
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

  toStep(): void {
    this.errorFlag = [false, false, false];

    if (this.parentGroup.get('firstInstituteEmail').invalid) {
      this.errorFlag[0] = true;
    }

    if (this.parentGroup.get('secondInstituteEmail').invalid) {
      this.errorFlag[1] = true;
    }

    if (this.parentGroup.get('secondName').invalid) {
      this.errorFlag[2] = true;
    }

    if (
        (this.errorFlag[0]==false || this.forkNum==6 || this.forkNum==7) &&
        (
          (this.errorFlag[2]==false && (this.errorFlag[1]==false && this.parentGroup.get('firstInstituteEmail').value!=this.parentGroup.get('secondInstituteEmail').value))
          || this.forkNum==0 || this.forkNum==1 || this.forkNum==4 || this.forkNum==5
        )
       ) {

      const preMembers = this.parentGroup.controls['preMembers'].value;

      const userMe: objectMiniPosition = {
        "_id": preMembers[0]._id,
        "name": preMembers[0].name,
        "pic": preMembers[0].pic,
        "email": this.parentGroup.get('firstInstituteEmail').value,
        "position": preMembers[0].position,
        "startDate": preMembers[0].startDate,
        "endDate": preMembers[0].endDate,
        "active": preMembers[0].active,
        "messageFlag": preMembers[0].messageFlag,
        "message": preMembers[0].message
      }

      const userPI: objectMiniPosition = {
        "_id": null,
        "name": this.parentGroup.get('secondName').value.trim(),
        "pic": null,
        "email": this.parentGroup.get('secondInstituteEmail').value,
        "position": (preMembers[1] || []).position,
        "startDate": (preMembers[1] || []).startDate,
        "endDate": (preMembers[1] || []).endDate,
        "active": (preMembers[1] || []).active,
        "messageFlag": (preMembers[1] || []).messageFlag,
        "message": (preMembers[1] || []).message
      }

      if (this.forkNum==2 || this.forkNum==3) {
        this.parentGroup.controls['preMembers'].setValue([userMe].concat([userPI]));
      } else {
        this.parentGroup.controls['preMembers'].setValue([userMe]);
      }
      // updateValueAndValidity

      this.newStep.emit([]);
    }
  }

}
