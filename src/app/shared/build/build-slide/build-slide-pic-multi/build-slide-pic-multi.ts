import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';

import { slideInOutAnimation } from '../../../animations/index';

declare var uploadcare: any;

@Component({
  selector: 'build-slide-pic-multi',
  templateUrl: 'build-slide-pic-multi.html',
  animations: [slideInOutAnimation],
  host: { '[@slideInOutAnimation]': '' },
  styleUrls: ['build-slide-pic-multi.css']
})

export class BuildSlidePicMultiComponent {
  @Input() title: string;
  @Input() itemId: string; // Folder name
  @Input() limit = 20;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() addMultiple: EventEmitter <string> = new EventEmitter(true);

  fileGroup: string;
  filesCount: number[] = [];

  disableFlag: boolean = false;

  constructor() { }

  ngAfterViewInit() {
    const that = this;
    const widget = uploadcare.Widget('#fileGroup');

    widget.onChange(function(value) {
      if (value) {
        value.promise().done(function(info) {
          that.fileGroup = info.cdnUrl;
          that.filesCount = new Array(info.count);
        });
      } else {
        that.fileGroup = '';
      }
    });
  }

  onSubmit() {
    this.disableFlag = true;
    this.addMultiple.emit(this.fileGroup);
  }

  onCancel() {
    // for (var _i = 0; _i < this.picComponent.responses.length; _i++) {
    //   if (this.picComponent.responses[_i].data.delete_token) {
    //     this.picComponent.deleteImage(this.picComponent.responses[_i].data,_i)
    //   }
    // }
    this.cancel.emit(false);
  }
}
