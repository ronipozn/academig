import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { UserService } from '../../../user/services/user-service';

import { ServicePriceType, ServicePriceMode, Price } from '../../services/resource-service';

import { slideInOutAnimation } from '../../animations/index';

@Component({
    selector: 'resource-price-build',
    templateUrl: 'price-build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['price-build.css']
})

export class ResourcePriceBuildComponent implements OnInit {
  @Input() newFlag: boolean;
  @Input() price: Price;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;

  newString: string;

  // currencySelect = ['Dollar', 'Euro', 'Pound', 'Shekel', 'Won', 'Ruble', 'Rupee', 'Yen', 'Yuan'];
  // currencySymbols = ['usd', 'eur', 'gbp', 'ils', 'krw', 'rub', 'inr', 'jpy', 'jpy'];
  // currencySymbols = ['$', '€', '£', '₪', '₩', '₽', '₹', '¥', '元'];

  priceTypeRadio = ServicePriceType;
  priceModeRadio = ServicePriceMode;

  constructor(
    public userService: UserService
  ) { }

  ngOnInit() {
    // console.log('this.price',this.price)

    this.formModel = new FormGroup({
      priceRequest: new FormArray([new FormControl(this.price.request, Validators.required)]),
      priceType: new FormControl(this.price.type),
      priceRange: new FormArray([new FormControl(this.price.range, Validators.required)]),
      priceStart: new FormControl(this.price.price[0], Validators.required),
      priceEnd: new FormControl(this.price.price[1], Validators.required),
      priceMode: new FormControl(this.price.mode, Validators.required),
      // priceCurrency: new FormControl(this.price.currency, Validators.required),
      priceInternalId: new FormControl(this.price.internalId)
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

  controlRequestFunc() {
    const requestFlag: boolean = this.formModel.get('priceRequest').value[0];

    if (requestFlag) {
      this.formModel.get('priceType').enable();
      this.formModel.get('priceStart').enable();
      this.formModel.get('priceEnd').enable();
      this.formModel.get('priceMode').enable();
      this.formModel.get('priceRange').enable();
      // this.formModel.get('priceCurrency').enable();
    } else {
      this.formModel.get('priceType').enable();
      this.formModel.get('priceStart').disable();
      this.formModel.get('priceEnd').disable();
      this.formModel.get('priceMode').disable();
      this.formModel.get('priceRange').disable();
      // this.formModel.get('priceCurrency').disable();
    }
  }

}
