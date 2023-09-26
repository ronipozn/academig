import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormArray, FormControl, Validators} from '@angular/forms';

import {objectMiniPosition} from '../../../shared/services/shared-service';

@Component({
  selector: 'signup-build-user-info',
  templateUrl: 'user-info.html',
  styleUrls: ['user-info.css']
})
export class SignUpBuildUserInfoComponent {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;
  @Input() labType: number;

  @Input() userId: string;
  @Input() userName: string;
  @Input() userPic: string;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  positionSelect = [{display: 'Full Professor', value: 100},
                    {display: 'Associate Professor', value: 101},
                    {display: 'Assistant Professor', value: 102},
                    {display: 'Professor Emeritus', value: 103},
                   ];

  educationSelect = [{display: 'Postdoc', value: 201},

                     {display: 'Ph.D.', value: 301},

                     {display: 'M.Sc.', value: 300},

                     {display: 'B.A.Sc.', value: 400},
                     {display: 'B.Sc.', value: 401},
                     {display: 'B.A.', value: 402},

                     {display: 'Assistant Researcher', value: 160},

                     {display: 'Director', value: 150},
                     // {display: 'Research Chair', value: 151},
                     {display: 'Lab Technician', value: 152},
                     {display: 'Lab Assistant', value: 153},
                     {display: 'Lab Secretary', value: 154},
                     {display: 'Lab Manager', value: 156},
                     {display: 'Senior Staff', value: 155},
                     {display: 'Research Assistant Professor', value: 157},

                     // {display: 'Licensed Engineer', value: 302},
                    ];

  submitStatus: boolean = false;
  emailDuplicated: boolean = false;
  piFlag: boolean = false;

  headIndex: number= null

  ngOnInit() {
    this.labType = (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) ? 1 : 0;

    if (this.forkNum==0 || this.forkNum==1) {
      this.headIndex = 0;
    } else if (this.forkNum==2 || this.forkNum==3) {
      this.headIndex = 1;
    }

    this.deleteALLFields()
    const preMembers = this.parentGroup.controls['preMembers'].value;
    preMembers.forEach((member, index) => this.addField(member, index))
  }

  addField(itemEmail: objectMiniPosition, i: number) {
    const fieldNames = this.parentGroup.get('members') as FormArray;

    fieldNames.push(
      new FormGroup({
        _id: new FormControl(itemEmail ? itemEmail._id : null),
        pic: new FormControl(itemEmail ? itemEmail.pic : null),
        name: new FormControl(itemEmail ? itemEmail.name : null),
        email: new FormControl({
          value: itemEmail ? itemEmail.email : null,
          disabled: ((itemEmail && itemEmail._id && (i>=((this.forkNum==2 || this.forkNum==3) ? 2 : 1))))
        }),
        // (this.forkNum==8 && i==0) ||
        position: new FormControl(itemEmail ? itemEmail.position : null, (this.forkNum==8 && i==1) ? null : Validators.required),
        startDate: new FormControl(itemEmail ? itemEmail.startDate : null),
        endDate: new FormControl({value: itemEmail ? itemEmail.endDate : null, disabled: true}),
        active: new FormArray([new FormControl((itemEmail && itemEmail.active) ? itemEmail.active[0] : true)]),
        messageFlag: new FormArray([new FormControl((itemEmail && itemEmail.messageFlag) ? itemEmail.messageFlag[0] : false)]),
        message: new FormControl(itemEmail ? itemEmail.message : null),
      })
    );

    // fieldGroup.controls['email'].disable();
  }

  deleteField(i: number) {
    const fieldNames = this.parentGroup.get('members') as FormArray;
    fieldNames.removeAt(i);
  }

  deleteALLFields() {
    const fieldNames = this.parentGroup.get('members') as FormArray;
    while (fieldNames.length !== 0) {fieldNames.removeAt(0)}
  }

  controlStatusPosition(i: number) {
    const fieldMembers = this.parentGroup.get('members') as FormArray;
    const fieldMember = fieldMembers.controls[i] as FormGroup;
    if (this.forkNum==8 && i==0) {
      this.parentGroup.controls['buildMode'].setValue((fieldMember.controls['position'].value<150) ? 0 : 2)
      this.headIndex = (fieldMember.controls['position'].value<150) ? 0 : 1;
      if (fieldMembers.controls.length==1 && fieldMember.controls['position'].value>=150) {
        const preMembers = this.parentGroup.controls['preMembers'].value;
        const userPI: objectMiniPosition = {
          "name": null, "_id": null, "pic": null, "email": null,
          "position": null, "startDate": null,  "endDate": null,
          "active": null, "messageFlag": null, "message": null
        }
        this.addField(userPI, 1);
      } else if (fieldMembers.controls.length==2 && fieldMember.controls['position'].value<150) {
        this.deleteField(1)
      }

      // this.headIndex = (fieldMember.controls['position'].value<150) ? 0 : null;
      // if (fieldMember.controls['position'].value<150) {
      //   this.piFlag = false
      //   this.headIndex = i
      //   this.parentGroup.controls['buildMode'].setValue(0)
      // } else if (this.headIndex==i) {
      //   this.headIndex = null
      //   this.parentGroup.controls['buildMode'].setValue(2)
      // }
    }
  }

  controlStatusActive(i: number) {
    const fieldMembers = this.parentGroup.get('members') as FormArray;
    const fieldMember = fieldMembers.controls[i] as FormGroup;
    fieldMember.controls['active'].value[0] ? fieldMember.controls['endDate'].disable() : fieldMember.controls['endDate'].enable();
  }

  controlStatusEmail(i: number) {
    const fieldMembers = this.parentGroup.get('members') as FormArray;
    const emails: string[] = fieldMembers.value.map(r=>r.email).filter(r=>(r!=undefined && r!=""));
    this.emailDuplicated = this.checkIfDuplicateExists(emails);
  }

  checkIfDuplicateExists(w){
    return new Set(w).size !== w.length
  }

  getControls(form) {
    return form.get('members').controls
  }

  togglePreviewEmail(popover) {
    if (popover.isOpen()) {
      popover.close();
    } else {
      popover.open();
    }
  }

  toStep(): void {
    this.submitStatus = false;

    if (this.parentGroup.get('members').invalid) {
      this.submitStatus = true;
    }

    if (this.submitStatus==false && this.emailDuplicated==false) {
      const members = this.parentGroup.controls['members'].value;
      const piIndex: number = members.findIndex(x => x.position<150);
      // if (piIndex>-1) this.piFlag = true;
      this.parentGroup.controls['preMembers'].setValue(members)
      this.newStep.emit([]);
    }
  }

  toPrevious(): void {
    const fieldMembers = this.parentGroup.get('members') as FormArray;
    const fieldMember = fieldMembers.controls[0] as FormGroup;
    fieldMember.controls['email'].enable();

    const members = this.parentGroup.controls['members'].value;

    this.parentGroup.controls['preMembers'].setValue(members)
    this.previousStep.emit();
  }

}
