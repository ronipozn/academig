import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { slideInOutAnimation } from '../../../animations/index';

import { ValidatorsReadService } from '../../../services/shared-service';

import { Folder, Journal } from '../../../services/publication-service';

@Component({
    selector: 'build-slide-read',
    templateUrl: 'build-slide-read.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-read.css']
})

export class BuildSlideReadComponent implements OnInit {
  // @Input() groupId: string;
  // @Input() userId: string;
  @Input() title: string;
  @Input() journal: Journal;
  @Input() date: Date;

  @Input() folder: Folder;
  @Input() mode: number; // 0: Add / 1: Edit

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() add: EventEmitter <any> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;
  streamFlag: boolean = false;

  privacyRadio: string[] = ['Public', 'Private'];

  constructor(private datepipe: DatePipe,
              private validatorsService: ValidatorsReadService) { }

  ngOnInit() {
    // console.log('this.folder',this.folder)
    this.formModel = new FormGroup({
      summary: new FormControl((this.mode==0) ? null : this.folder.summary),
      privacy: new FormControl((this.mode==0) ? null : this.folder.privacy),
      date: new FormControl((this.mode==0) ? this.datepipe.transform(new Date(), 'dd-mm-yyyy') : this.folder.date, [this.validatorsService.rangeValidator({'range': ''}), Validators.required]),
      end: new FormControl((this.mode==0) ? null : this.folder.end, [this.validatorsService.rangeValidator({'range': ''}), Validators.required]),

      rating: new FormControl((this.mode==0) ? null : this.folder.rating),
      recommend: new FormControl(null),
      recommended: new FormControl(null),
      feed: new FormArray([new FormControl((this.mode==0) ? true : this.folder.feed)]),

      recommendInvites: new FormArray([ ]),
      recommendedInvites: new FormArray([ ])
    });

    this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['date'].updateValueAndValidity({emitEvent: false});
    });
    this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['date'].updateValueAndValidity({emitEvent: false});
    });
  }

  setToday() {
    this.formModel.controls['end'].setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'));
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.formModel.value.checked = true;
      this.formModel.value.folder = "read";
      if (this.mode==0) {
        this.disableFlag = true;
        this.add.emit(this.formModel.value);
      } else if (this.mode==1) {
        this.disableFlag = true;
        this.update.emit(this.formModel.value);
      }
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  recommendUpdate(event) {
    if (event.type==1) {
      this.addField(event.name, "recommendInvites");
    } else {
      this.deleteField(event.name, "recommendInvites");
    }
  }

  recommendedUpdate(event) {
    if (event.type==1) {
      this.addField(event.name, "recommendedInvites");
    } else {
      this.deleteField(event.name, "recommendedInvites");
    }
  }

  addField(name: string, control: string) {
    const fieldNames = this.formModel.get(control) as FormArray;
    fieldNames.push(
      new FormGroup({
        name: new FormControl(name),
        email: new FormControl(null),
      })
    );
  }

  deleteField(name: string, control: string) {
    const fieldNames = this.formModel.get(control) as FormArray;
    const i = fieldNames.value.findIndex(r => r.name==name);
    fieldNames.removeAt(i);
  }

  getRecommendControls(form, control: string) {
    return form.get(control).controls
  }

}
