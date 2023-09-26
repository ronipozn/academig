import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { OpenPosition } from '../../../../../shared/services/position-service';

import { slideInOutAnimation } from '../../../../../shared/animations/index';

@Component({
    selector: 'position-build-slide-general',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class PositionBuildGeneralComponent implements OnInit {
  @Input() type: number;
  @Input() site: string;
  @Input() spotsAvailable: number;
  @Input() contractLength: number;
  @Input() contractLengthType: number;
  @Input() salary: number;
  @Input() salaryCurrency: number;
  @Input() id: string;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus = false;
  controlStatus: boolean[] = [false, false];
  formModel: FormGroup;

  // asapSelect = ["As soon as possible"];
  // extendSelect = ["Including an option to extend the contract"];
  lengthSelect = ['Months', 'Years'];
  currencySelect = ['Dollar', 'Euro', 'Pound', 'Shekel', 'Won', 'Ruble', 'Rupee', 'Yen', 'Yuan'];

  typeSelect = ["Full-time", "Part-time"];

  constructor(
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private router: Router,
  ) {}

  ngOnInit() {
    this.formModel = new FormGroup({
      spotsAvailable: new FormControl(this.spotsAvailable),
      type: new FormControl(this.type),
      site: new FormControl(this.site),
      contractLength: new FormControl(this.contractLength),
      contractLengthType: new FormControl(this.contractLengthType),
      salary: new FormControl(this.salary),
      salaryCurrency: new FormControl(this.salaryCurrency),
      id: new FormControl(this.id)
      // employmentType: new FormControl(''),
      // location: new FormControl(''),
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
