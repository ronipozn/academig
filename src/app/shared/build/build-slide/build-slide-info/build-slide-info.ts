import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { PublicInfo } from '../../../../shared/services/shared-service';

import { slideInOutAnimation } from '../../../../shared/animations/index';

@Component({
    selector: 'build-slide-info',
    templateUrl: 'build-slide-info.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-info.css']
})

export class BuildSlideInfoComponent implements OnInit {
  @Input() mode: number;
  @Input() publicInfo: PublicInfo;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus: boolean = false;
  disableFlag: boolean = false;

  title: string[] = ["Researcher", "Lab", "Department", "University", null, "Podcast", "Event", "App"];
  site: string[] = ["Your", "Lab", "Department", "University", null, "Podcast", "Event", "App"];

  formModel: FormGroup;

  ngOnInit() {
    this.formModel = new FormGroup({
      address: new FormControl(this.publicInfo ? this.publicInfo.address : ''),
      email: new FormControl(this.publicInfo ? this.publicInfo.email : ''),
      phone: new FormControl(this.publicInfo ? this.publicInfo.phone : ''),
      fax: new FormControl(this.publicInfo ? this.publicInfo.fax : ''),
      website: new FormControl(this.publicInfo ? this.publicInfo.website : ''),
    });
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.disableFlag = true;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
