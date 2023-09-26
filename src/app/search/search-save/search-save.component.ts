import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../shared/animations/index';
import { CustomValidators } from 'ng2-validation';

import {GroupSize, CompanySize} from '../../shared/services/group-service';
// import { Refinements} from '../../shared/services/shared-service';

@Component({
    selector: 'search-save',
    templateUrl: 'search-save.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['search-save.css']
})

export class SearchSaveComponent implements OnInit {
  @Input() title: string;
  @Input() query: string;
  @Input() hitsLength: number;
  @Input() refinements: any;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;

  keys: string[];
  attributes: string[][] = [];
  attributesSum: number = 0;

  disableFlag: boolean = false;
  enableFlag: boolean = false;

  submitStatus: boolean = false;

  labFlag: boolean = true;
  sizeRange: string = null;
  groupSize = GroupSize;
  companySize = CompanySize;

  ngOnInit() {
    this.keys = Object.keys(this.refinements);

    // for (var i = 0; i < 9; i++) {
    for (var i = 0; i <= this.keys.length-1; i++) {
      this.attributes[i] = this.refinements[this.keys[i]] || [];
    }

    // console.log('this.keys',this.keys)
    // console.log('this.attributes',this.attributes)
    // console.log('this.refinements',this.refinements)

    this.attributesSum = this.attributes.reduce((count, row) => count + row.length, 0);

    // if (this.refinements.size!=null && this.refinements.size<7) {
    //   this.sizeRange = this.labFlag ? this.groupSize[this.groupSize.findIndex(y => y.id == this.refinements.size)].name : this.companySize[this.companySize.findIndex(y => y.id == this.refinements.size)].name;
    // }

    this.formModel = new FormGroup({
      title: new FormControl(this.title, Validators.required),
    });

    // this.enableFlag = (this.attributesSum>0) || (this.query.length>0) || (this.refinements.size!=null && this.refinements.size<7);
    this.enableFlag = (this.attributesSum>1) || (this.query.length>0);
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

  titleCase(str) {
    if (!str) return null
    var splitStr = str.toLowerCase().split('_');
    for (var i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length,
      // as your for does that for you. Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  }

}
