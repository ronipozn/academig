import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { Rank } from '../../../../shared/services/university-service';
import { slideInOutAnimation } from '../../../../shared/animations/index';

@Component({
    selector: 'build-slide-rank',
    templateUrl: 'build-slide-rank.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-rank.css']
})

export class BuildSlideRankComponent implements OnInit {
  @Input() mode: number;
  @Input() rank: Rank;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus: boolean = false;
  disableFlag: boolean = false;

  formModel: FormGroup;

  ngOnInit() {
    this.formModel = new FormGroup({
      times: new FormControl(this.rank ? this.rank.times : null),
      shanghai: new FormControl(this.rank ? this.rank.shanghai : null),
      top: new FormControl(this.rank ? this.rank.top : null),
      usnews: new FormControl(this.rank ? this.rank.usnews : null),

      facebook: new FormControl(this.rank ? this.rank.facebook : null),
      twitter: new FormControl(this.rank ? this.rank.twitter : null),
      linkedin: new FormControl(this.rank ? this.rank.linkedin : null),
      instagram: new FormControl(this.rank ? this.rank.instagram : null),
      youtube: new FormControl(this.rank ? this.rank.youtube : null),
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
