import { Component, Input, Output, EventEmitter } from '@angular/core';

import { FormGroup, FormControl } from '@angular/forms';

import { BuildMultiComponent } from '../build-multi/build-multi';
import { objectMini } from '../../../../services/shared-service';
import { slideInOutAnimation } from '../../../../animations/index';

@Component({
    selector: 'build-slide-multi',
    templateUrl: 'build-slide-multi.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-multi.css']
})

export class BuildSlideMultiComponent {
  @Input() title: string;
  @Input() itemTitle: string;
  @Input() publicationTitle: string;
  @Input() type: number;
  @Input() stackPic: string;
  @Input() inviteFlag: boolean;
  @Input() academicFlag: boolean = false;
  @Input() pre: objectMini[] = [];

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;

  submitStatus = false;

  constructor() {
    this.formModel = new FormGroup({});
  }

  onSubmit() {
    if (this.formModel.valid) {
      if (this.type == 1) { // new publication?
        this.formModel.value.multi.map(r => r.name = (r.name.name ? r.name.name : r.name) )
      } else if (this.type ==2) { // update publication?
        this.formModel.getRawValue().multi.forEach((item, index) => {
          this.formModel.value.multi[index] = item.name.name ? Object.assign(item.name, {"email": item.email, "message": item.message}) : item
        })
      }

      this.update.emit(this.formModel.value.multi);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
