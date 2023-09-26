import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { UserService } from '../../../user/services/user-service';

import { CustomValidators } from 'ng2-validation';

import { ResourceDetails } from '../../services/resource-service';

import { slideInOutAnimation } from '../../animations/index';

declare var uploadcare: any;

@Component({
    selector: 'resource-table-build',
    templateUrl: 'table-build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['table-build.css']
})

export class ResourceTableBuildComponent implements OnInit {
  @Input() headline: string;
  @Input() mode: number;
  @Input() index: number;
  @Input() newFlag: boolean;
  @Input() resource: ResourceDetails;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;
  uploadFlagPic = false;
  uploadFlagFiles = false;

  newString: string;
  vendorString: string;

  itemName: string;
  itemPic: string;
  itemDescription: string;
  itemDate: Date;
  itemVersion: string;
  itemVendor: string;
  itemModel: string;
  itemPrice: string;
  itemQuantity: string;
  itemLink: string;
  itemFiles: string;

  constructor(
    private datepipe: DatePipe,
    public userService: UserService
  ) { }

  ngOnInit() {
    this.newString = (this.newFlag) ? 'Add' : 'Update';
    this.vendorString = (this.mode == 3) ? 'Vendor' : 'Manufacturer';

    if (this.newFlag == false) {
      switch (this.mode) {
         case 0: { // MANUAL
           this.itemName = this.resource.manuals[this.index].name;
           this.itemDescription = this.resource.manuals[this.index].description;
           this.itemVersion = this.resource.manuals[this.index].version;
           this.itemDate = this.resource.manuals[this.index].date;
           this.itemFiles = this.resource.manuals[this.index].files;
           break; }
         case 1: { // CODE
           this.itemName = this.resource.codes[this.index].name;
           this.itemDescription = this.resource.codes[this.index].description;
           this.itemDate = this.resource.codes[this.index].date;
           this.itemVersion = this.resource.codes[this.index].version;
           this.itemLink = this.resource.codes[this.index].git;
           this.itemFiles = this.resource.codes[this.index].files;
           break;
         }
         case 2: { // CAD
           this.itemName = this.resource.cads[this.index].name;
           this.itemDescription = this.resource.cads[this.index].description;
           this.itemDate = this.resource.cads[this.index].date;
           this.itemVersion = this.resource.cads[this.index].version;
           this.itemFiles = this.resource.cads[this.index].files;
           break;
         }
         case 3: { // INVENTORY
           this.itemName = this.resource.inventories[this.index].name;
           this.itemPic = this.resource.inventories[this.index].pic;
           this.itemDescription = this.resource.inventories[this.index].description;
           this.itemVendor = this.resource.inventories[this.index].vendor;
           this.itemModel = this.resource.inventories[this.index].model;
           this.itemPrice = this.resource.inventories[this.index].price;
           this.itemQuantity = this.resource.inventories[this.index].quantity;
           this.itemLink = this.resource.inventories[this.index].link;
           this.itemFiles = this.resource.inventories[this.index].files;
           break;
         }
         case 4: { // EQUIPMENT
           this.itemName = this.resource.equipments[this.index].name;
           this.itemPic = this.resource.equipments[this.index].pic;
           this.itemDescription = this.resource.equipments[this.index].description;
           this.itemVendor = this.resource.equipments[this.index].manufacturer;
           this.itemModel = this.resource.equipments[this.index].model;
           this.itemPrice = this.resource.equipments[this.index].price;
           this.itemLink = this.resource.equipments[this.index].link;
           this.itemFiles = this.resource.equipments[this.index].files;
           break;
         }
      }
    }

    this.formModel = new FormGroup({
      name: new FormControl(this.itemName, Validators.required),
      description: new FormControl(this.itemDescription),
      files: new FormControl(this.itemFiles),
    });

    if (this.mode <= 2) {
      this.formModel.addControl('version', new FormControl(this.itemVersion));
      this.formModel.addControl('date', this.newFlag ?
                                new FormControl(this.datepipe.transform(new Date(), 'yyyy-MM-dd')) :
                                new FormControl(this.datepipe.transform(this.itemDate, 'yyyy-MM-dd')));
    }

    if (this.mode == 1 || this.mode == 3 || this.mode == 4) {
      this.formModel.addControl('link', new FormControl(this.itemLink, CustomValidators.url)); // GIT for 1

      this.formModel.controls['link'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['link'].setValue(value.trim(), {emitEvent: false});
      });
    }

    if (this.mode == 3) {
      this.formModel.addControl('quantity', new FormControl(this.itemQuantity));
    }

    if (this.mode == 3 || this.mode == 4) {
      this.formModel.addControl('price', new FormControl(this.itemPrice));
      // this.formModel.addControl("pic", new FormControl(this.itemPic));
      this.formModel.addControl('vendor', new FormControl(this.itemVendor)); // Manufacturer for 3
      this.formModel.addControl('model', new FormControl(this.itemModel));
    }

  }

  // uploadOnChanges(u: any, mode: number) {
  //   if (mode==0) {
  //     that.uploadFlagPic = true;
  //   } else {
  //     that.uploadFlagFiles = true;
  //   }
  // }
  //
  // uploadComplete(u: any, mode: number) {
  //   if (mode==0) {
  //     that.uploadFlagPic = false;
  //     this.itemPic = u.cdnUrl;
  //   } else {
  //     that.uploadFlagFiles = false;
  //     this.itemFiles = u.cdnUrl;
  //   }
  // }

  ngAfterViewInit() {
    const that = this;

    if (this.mode >= 3) {
      const widgetPic = uploadcare.Widget('#pic');
      if (!this.newFlag) widgetPic.value(that.itemPic);

      widgetPic.onChange(function(value) {
        if (value) {
          that.uploadFlagPic = true;
          value.promise().done(function(info) {
            that.itemPic = info.cdnUrl;
            that.uploadFlagPic = false;
          });
        } else {
          that.itemPic = '';
        }
      });
    }

    const widgetFiles = uploadcare.Widget('#files');
    if (!this.newFlag) { widgetFiles.value(that.itemFiles); }

    widgetFiles.onChange(function(value) {
      if (value) {
        that.uploadFlagFiles = true;
        value.promise().done(function(info) {
          that.itemFiles = info.cdnUrl;
          that.uploadFlagFiles = false;
        });
      } else {
        that.itemFiles = '';
      }
    });

  }

  onSubmit() {
    if (this.formModel.valid) {
      this.formModel.value.files = this.itemFiles;
      this.formModel.value.pic = this.itemPic;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
