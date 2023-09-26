import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { OpenPosition } from '../../../../../shared/services/position-service';

import { slideInOutAnimation } from '../../../../../shared/animations/index';

@Component({
    selector: 'position-build-slide-letters',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class PositionBuildLettersComponent implements OnInit {
  @Input() lettersGuidelines: string;
  @Input() lettersRequired: boolean[];
  @Input() gradesRequired: boolean[];
  @Input() numReferees: number;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus = false;
  controlStatus: boolean[] = [false, false];
  formModel: FormGroup;

  lettersSelect = [
    {value: 0, viewValue: 'Curriculum vitae'},
    {value: 1, viewValue: 'Letter of motivation'},
    {value: 2, viewValue: 'Letter of interest'},
    {value: 3, viewValue: 'Cover letter'},
    {value: 4, viewValue: 'Project proposal'},
    {value: 5, viewValue: 'Teaching statement'},
  ];

  gradesSelect = [
    {value: 0, viewValue: 'GPA'},
    {value: 1, viewValue: 'GRE'},
    {value: 2, viewValue: 'TOEFL'},
  ];

  constructor(
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private router: Router,
  ) { }

  ngOnInit() {
    this.formModel = new FormGroup({
      gradesRequired: new FormControl(this.gradesRequired),
      lettersRequired: new FormControl(this.lettersRequired),
      lettersGuidelines: new FormControl(this.lettersGuidelines),
      numReferees: new FormControl(this.numReferees),
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
