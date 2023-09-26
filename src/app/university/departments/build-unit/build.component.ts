import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { slideInOutAnimation } from '../../../shared/animations/index';
import { CustomValidators } from 'ng2-validation';

@Component({
    selector: 'unit-build',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class UniversityUnitBuildComponent implements OnInit {
  @Input() name: string;
  @Input() icon: number = 0;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;

  iconsTitles = ['Exact Sciences',
                 'Life Sciences',
                 'Engineering',
                 'Social Sciences',
                 'Humanities',
                 'Interdisciplinary Studies',
                 'Religious Studies',
                 // 'Jewish Studies',
                 'Other'
                ];

  icons: string[] = ['exact_sciences',
                     'life_sciences',
                     'engineering',
                     'social_sciences',
                     'humanities',
                     'interdisciplinary_studies',
                     'religious_studies',
                     // 'torah_studies',
                     'department_general'];

  ngOnInit() {
    this.formModel = new FormGroup({
      name: new FormControl(this.name, Validators.required),
      icon: new FormControl(Number(this.icon), Validators.required),
    });
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
