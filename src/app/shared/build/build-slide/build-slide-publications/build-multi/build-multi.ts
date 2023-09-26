import {Component, Input, OnInit} from '@angular/core';
import {FormGroup, FormArray, FormControl} from '@angular/forms';

import {objectMini, objectMiniEmail} from '../../../../services/shared-service';
import {UserService} from '../../../../../user/services/user-service';

@Component({
  selector: 'build-multi',
  templateUrl: 'build-multi.html',
  styleUrls: ['build-multi.css']
})
export class BuildMultiComponent implements OnInit {
  @Input() pre: objectMini[];

  @Input() parentGroup: FormGroup;
  @Input() controlName: string;
  @Input() userId: string;

  @Input() itemTitle: string;
  @Input() itemIcon: string;
  @Input() stackPic: string;

  @Input() publicationTitle: string;

  @Input() itemFirst: boolean = false;
  @Input() submitStatus: boolean = false;

  @Input() inviteFlag: boolean;
  @Input() academicFlag: boolean = false;

  @Input() type: number; // 1 - Fundings
                         // 0,2 - Authors

  coAuthorsEmailCount: number = 0;

  existIds: string[] = [];
  existIdsFill: string[];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.parentGroup.addControl(this.controlName, new FormArray([ ]));
    if (this.pre && this.pre[0]) { this.pre.forEach((item) => { this.addField(item) }) }
  }

  addField(item: objectMini) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;
    const itemEmail = item as objectMiniEmail;
    // const name = ((this.type==2 || itemEmail==null) ? itemEmail : ((this.type==1) ? {'name': itemEmail.name} : itemEmail.name));

    if ((this.type==0 || this.type==2) && itemEmail) {
      if (itemEmail._id==null && itemEmail.email==null) this.coAuthorsEmailCount++;
      this.existIds.push(itemEmail._id)
      this.existIdsFill = this.existIds.filter(r => r != '');
    }

    fieldNames.push(
      new FormGroup({
        _id: new FormControl(itemEmail ? itemEmail._id : null),
        pic: new FormControl(itemEmail ? itemEmail.pic : null),
        name: new FormControl(itemEmail ? (this.type==1) ? {"name": itemEmail.name} : itemEmail.name : null),
        email: new FormControl(itemEmail ? itemEmail.email : null),
        message: new FormControl(itemEmail ? itemEmail.message : null),
      })
    );

    var fieldGroup = fieldNames.controls[fieldNames.length-1] as FormGroup;

    if (this.type==2 && !this.academicFlag && itemEmail && (itemEmail._id || itemEmail.email)) {
      fieldGroup.controls['name'].disable();
      fieldGroup.controls['email'].disable();
    } else if (this.inviteFlag) {
      fieldGroup.controls['name'].disable();
    }

  }

  deleteField(i: number) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;
    fieldNames.removeAt(i);
    this.existIds[i] = '';
    this.existIdsFill = this.existIds.filter(r => r != '');
  }

  deleteALLFields() {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;
    while (fieldNames.length !== 0) {fieldNames.removeAt(0)}
  }

  getControls(form) {
    return form.get(this.controlName).controls
  }

  togglePreviewEmail(popover) {
    if (popover.isOpen()) {
      popover.close();
    } else {
      popover.open();
    }
  }

  // controlTitleFunc(i: number) {
    // const fieldNames = this.parentGroup.get(this.controlName) as FormArray;
    // const query = this.parentGroup.value.multi[i];
    // if (query.name._id) (<FormArray>this.parentGroup.controls[this.controlName]).at(i).setValue(Object.assign(query.name,{email: "hhh"}));
  // }

  controlStatus(i: number) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;
    const fieldGroup = fieldNames.controls[i] as FormGroup;
    const _id = fieldGroup.value.name._id;

    if (_id) this.existIds[i] = _id; else this.existIds[i] = '';
    this.existIdsFill = this.existIds.filter(r => r != '');

    // if (fieldNames.controls[i].value.name._id) {
    //   fieldGroup.controls['email'].setValue('');
    //   fieldGroup.controls['email'].disable();
    // } else {
    //   fieldGroup.controls['email'].setValue('');
    //   fieldGroup.controls['email'].enable();
    // }
  }

}
