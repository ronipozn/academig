import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UserService } from '../../../../user/services/user-service';
import { slideInOutAnimation } from '../../../animations/index';

@Component({
    selector: 'build-slide-tags',
    templateUrl: 'build-slide-tags.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-tags.css']
})

export class BuildSlideTagsComponent implements OnInit {
  @Input() tags: string[];
  @Input() max: number = 10;
  @Input() headline: string = 'Keywords';
  @Input() key: string = 'keyword';

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  tagsModified: string[] = [];

  title: string[] = ['New', 'Update']

  constructor(
    public userService: UserService
  ) {
    this.formModel = new FormGroup({
      tagsModified: new FormControl('', Validators.required),
      tag: new FormControl(''),
    });
  }

  ngOnInit() {
    this.tagsModified = this.tags ? this.tags.slice(0) : []; // clone
    this.formModel.controls['tagsModified'].setValue(this.tagsModified);
  }

  onSubmit() {
    // if (this.formModel.valid) {
      this.disableFlag = true;
      this.update.emit(this.formModel.value.tagsModified);
    // } else {
      // this.submitStatus=!this.submitStatus;
    // }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  addTag() {
    let duplicate: boolean = false;

    for (const tag of this.formModel.value.tagsModified) {
      if (tag == this.formModel.value.tag) duplicate = true;
    }

    if (this.formModel.value.tag && duplicate == false && this.formModel.value.tagsModified.length<this.max) {
      this.formModel.value.tagsModified.push(this.formModel.value.tag);
      this.formModel.controls['tag'].setValue('');
    }
  }

}
