import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../../../shared/animations/index';
import { CustomValidators } from 'ng2-validation';

import { complexName } from '../../../../shared/services/shared-service';

@Component({
    selector: 'admin-change',
    templateUrl: 'change.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['change.css']
})

export class ChangeLabComponent implements OnInit {
  @Input() university: complexName;
  @Input() department: complexName;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;
  universityId: string;

  ngOnInit() {
    this.formModel = new FormGroup({
      // university: new FormControl({'id': 0, 'name': this.university.name, 'link': null, 'pic': null}),
      // department: new FormControl({'id': 0, 'name': this.department.name, 'link': null, 'pic': null})
      university: new FormControl(this.university),
      department: new FormControl(this.department)
    });

    this.universityId = this.university._id
  }

  onSubmit() {
    if (this.formModel.valid && this.formModel.value.department._id && this.formModel.value.university._id) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  keyUp(i: number): void {
    var universityField = this.formModel.get('university').value;
    // this.departmentField = this.formModel.get('department').value;

    if (i == 0) {
      this.universityId = universityField ? universityField._id : null;
      // this.errorFlag[0] = false;
    }
  }

}
