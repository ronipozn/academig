import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';

import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment, Moment} from 'moment';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'build-month-field',
  templateUrl: 'build-month-field.html',
  providers: [
  // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
  // application's root module. We provide it at the component level here, due to limitations of
  // our example generation script.
  {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

  {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
],
})
export class BuildMonthtFieldComponent implements OnInit, OnDestroy {
  @Output() controlStatus: EventEmitter <boolean> = new EventEmitter(true);

  @Input() itemTitle: string;
  @Input() parentGroup: FormGroup;
  @Input() controlName: string;
  @Input() itemExplain: string = null;
  @Input() labelRequired: boolean = false;
  @Input() errorFlag: boolean = true;

  @Input() set submitStatus(value: boolean) {
     this._controlStatus = value;
     this.changeStatus(this._controlStatus);
  }

  get submitStatus(): boolean {
    return this._controlStatus;
  }

  _controlStatus: boolean;
  _ignite: boolean = false;
  subscription: Subscription;

  ngOnInit() {
    this.subscription = this.parentGroup.controls[this.controlName].valueChanges.subscribe(data => {
      this._controlStatus = false;
      this.controlStatus.emit(false);
    })
  }

  changeStatus(a: boolean) {
    if (this._ignite == false) {
      this._ignite = true;
    } else {
      this._controlStatus = true
      this.controlStatus.emit(true);
    }
  }

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      'has-error': this.isFieldValid(form, field),
      'has-feedback': this.isFieldValid(form, field)
    };
  }

  date = new FormControl(moment());

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    // const ctrlValue = this.parentGroup.controls[this.controlName].value;
    ctrlValue.year(normalizedYear.year());
    this.parentGroup.controls[this.controlName].setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    // const ctrlValue = this.parentGroup.controls[this.controlName].value;
    ctrlValue.month(normalizedMonth.month());
    this.parentGroup.controls[this.controlName].setValue(ctrlValue);
    datepicker.close();
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

}
