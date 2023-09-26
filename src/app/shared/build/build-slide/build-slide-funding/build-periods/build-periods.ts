import {Component, Input, OnInit, EventEmitter} from '@angular/core';
import {FormGroup, FormArray, FormControl, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';

import {ValidatorsService} from '../../../../services/shared-service';

import {fundingPeriods} from '../../../../services/funding-service';

@Component({
  selector: 'build-periods',
  templateUrl: 'build-periods.html',
  styleUrls: ['build-periods.css']
})
export class BuildFundingPeriodsComponent implements OnInit {
  @Input() newFlag: boolean;
  @Input() itemTitle: string;
  @Input() itemSmall: boolean = false;
  @Input() submitStatus: boolean = false;

  @Input() parentGroup: FormGroup;
  @Input() controlName: string;

  @Input() periods: fundingPeriods[];

  currencySelect = ['Dollar', 'Euro', 'Pound', 'Shekel', 'Won', 'Ruble', 'Rupee', 'Yen', 'Yuan'];
  // currencySymbols = ['usd', 'eur', 'gbp', 'ils', 'krw', 'rub', 'inr', 'jpy', 'jpy'];
  currencySymbols = ['$', '€', '£', '₪', '₩', '₽', '₹', '¥', '元'];

  totalAmounts: number[] = new Array(9).fill(0);

  constructor(
    private datepipe: DatePipe,
    private validatorsService: ValidatorsService) {}

  ngOnInit() {
    this.parentGroup.addControl(this.controlName,
      new FormArray([
      ])
    );

    if (!this.newFlag) {
      this.periods.forEach((period) => {
        this.addField(period)
      });
    }
  }

  addField(period: fundingPeriods) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;

    fieldNames.push(
      new FormGroup({

        start: new FormControl(period ? this.datepipe.transform(period.start, 'yyyy-MM') : null, [this.validatorsService.rangeValidator({'range': ''}), Validators.required]),

        end: new FormControl(period ? this.datepipe.transform(period.end, 'yyyy-MM') : null, [this.validatorsService.rangeValidator({'range': ''}), Validators.required]),

        single: new FormArray([new FormControl(period ? (period.mode == 2) : false)]),

        present: new FormArray([new FormControl(period ? (period.mode == 1) : false)]),

        amount: new FormControl(period ? period.amount : ''),

        currency: new FormControl(period ? period.currency : 0)

      })

    );

    this.controlStatusFunc(fieldNames.length - 1, 0)
    this.controlStatusFunc(fieldNames.length - 1, 1)
    this.controlStatusFunc(fieldNames.length - 1, 2)

    fieldNames.controls[fieldNames.length - 1].get('start').valueChanges.subscribe((value: string) => {
      fieldNames.controls[fieldNames.length - 1].get('end').updateValueAndValidity({emitEvent: false});
    });

    fieldNames.controls[fieldNames.length - 1].get('end').valueChanges.subscribe((value: string) => {
      fieldNames.controls[fieldNames.length - 1].get('start').updateValueAndValidity({emitEvent: false});
    });

  }

  deleteField(i: number) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;

    fieldNames.removeAt(i);
    this.controlStatusFunc(i, 2);

  }

  controlStatusFunc(i: number, j: number) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;

    // console.log('single',fieldNames.controls[i].get('single').value)

    if (j == 0) {
      fieldNames.controls[i].get('single').value[0] ?
        (
         fieldNames.controls[i].get('end').disable(),
         fieldNames.controls[i].get('present').disable()
        ) : (
         fieldNames.controls[i].get('end').enable(),
         fieldNames.controls[i].get('present').enable()
        )
    } else if (j == 1 && fieldNames.controls[i].get('single').value[0] == false) {
      fieldNames.controls[i].get('present').value[0] ?
        (fieldNames.controls[i].get('end').disable()) :
        (fieldNames.controls[i].get('end').enable())
    } else if (j == 2) {
      this.totalAmounts = new Array(9).fill(0);
      let a, c: number;

      for (let _i = 0; _i < fieldNames.controls.length; _i++) {
        a = parseInt(fieldNames.controls[_i].get('amount').value);
        c = parseInt(fieldNames.controls[_i].get('currency').value);
        this.totalAmounts[c] += a ? a : 0;
      }
    }

  }

  getControls(periodForm) {
    // FIX: this function get called a lot. Is it OK?
    return periodForm.get(this.controlName).controls
  }

}
