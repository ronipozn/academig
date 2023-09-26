import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { SocialInfo } from '../../../../shared/services/shared-service';
import { slideInOutAnimation } from '../../../../shared/animations/index';

@Component({
    selector: 'build-slide-social',
    templateUrl: 'build-slide-social.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-social.css']
})

export class BuildSlideSocialComponent implements OnInit {
  @Input() mode: number;
  @Input() socialInfo: SocialInfo;
  @Input() type: number;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  title: string[] = ["Researcher", "Lab", "Department", "University", null, "Podcast", "Event", "App"];

  submitStatus: boolean = false;
  disableFlag: boolean = false;

  formModel: FormGroup;

  ngOnInit() {
    this.formModel = new FormGroup({
      linkedin: new FormControl(this.socialInfo ? this.socialInfo.linkedin : ''),
      twitter: new FormControl(this.socialInfo ? this.socialInfo.twitter : ''),
      scholar: new FormControl(this.socialInfo ? this.socialInfo.scholar : ''),
      orcid: new FormControl(this.socialInfo ? this.socialInfo.orcid : ''),
      github: new FormControl(this.socialInfo ? this.socialInfo.github : ''),
      researchgate: new FormControl(this.socialInfo ? this.socialInfo.researchgate : ''),
      facebook: new FormControl(this.socialInfo ? this.socialInfo.facebook : ''),
      youtube: new FormControl(this.socialInfo ? this.socialInfo.youtube : ''),
      pinterest: new FormControl(this.socialInfo ? this.socialInfo.pinterest : ''),
      instagram: new FormControl(this.socialInfo ? this.socialInfo.instagram : ''),
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
