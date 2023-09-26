import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { CustomValidators } from 'ng2-validation';

import {GroupSize, CompanySize} from '../../../../shared/services/group-service';
import {ValidatorsService, SharedService} from '../../../../shared/services/shared-service';

import { slideInOutAnimation } from '../../../../shared/animations/index';

@Component({
    selector: 'build-slide-data',
    templateUrl: 'build-data.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-data.css']
})

export class BuildSlideDataComponent implements OnInit {
  @Input() title: string;
  @Input() topic: string;
  @Input() establish: Date;
  @Input() size: number;
  @Input() groupType: boolean;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <{topic: string, establish: Date, size: number}> = new EventEmitter(true);

  groupSize = GroupSize;
  companySize = CompanySize;

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  topics: string[];

  constructor(private datepipe: DatePipe,
              private sharedService: SharedService,
              private validatorsService: ValidatorsService) { }

  async ngOnInit() {
    this.formModel = new FormGroup({
      topic: new FormControl(this.topic),
      establish: new FormControl(this.datepipe.transform(this.establish, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''})]),
      size: new FormControl(this.size),
    });

    this.topics = await this.sharedService.queryTopics('biology');
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
