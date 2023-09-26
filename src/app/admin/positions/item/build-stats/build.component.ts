import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { slideInOutAnimation } from '../../../../shared/animations/index';
import { CustomValidators } from 'ng2-validation';

@Component({
    selector: 'stats-build',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class PositionStatsBuildComponent implements OnInit {
  @Input() stat: number[];
  @Input() mode: number;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);
  @Output() add: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;

  statsTabs: string[] = ["View","Clicks","Applies"]
  statsChannels: string[] = [];

  ngOnInit() {
    if (this.mode==0) {
      this.statsChannels = ["organic", "facebook", "twitter", "linkedin", "slack", "newsletter"];
      this.formModel = new FormGroup({
        organic: new FormArray([new FormControl(), new FormControl(), new FormControl()]),
        facebook: new FormArray([new FormControl(), new FormControl(), new FormControl()]),
        twitter: new FormArray([new FormControl(), new FormControl(), new FormControl()]),
        linkedin: new FormArray([new FormControl(), new FormControl(), new FormControl()]),
        slack: new FormArray([new FormControl(), new FormControl(), new FormControl()]),
        newsletter: new FormArray([new FormControl(), new FormControl(), new FormControl()])
      });
    } else {
      this.statsChannels = ["specific"];
      this.formModel = new FormGroup({
        specific: new FormArray([new FormControl(this.stat ? this.stat[0] : null), new FormControl(this.stat ? this.stat[1] : null), new FormControl(this.stat ? this.stat[2] : null)])
      });
    }
  }

  onSubmit() {
    if (this.formModel.valid) {
      if (this.mode==0) {
        this.add.emit([
          this.formModel.value.organic,
          this.formModel.value.facebook,
          this.formModel.value.twitter,
          this.formModel.value.linkedin,
          this.formModel.value.slack,
          this.formModel.value.newsletter
        ]);
      } else {
        this.update.emit(this.formModel.value.specific);
      }
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
