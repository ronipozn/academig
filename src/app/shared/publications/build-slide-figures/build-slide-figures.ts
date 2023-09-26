import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UserService } from '../../../user/services/user-service';

import { slideInOutAnimation } from '../../animations/index';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-figures',
    templateUrl: 'build-slide-figures.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-figures.css']
})

export class BuildSlideFiguresComponent {
  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  files1: string;
  files1Count: number[] = [];

  files2: string;
  files2Count: number[] = [];

  files3: string;
  files3Count: number[] = [];

  submitStatus = false;

  constructor(
    public userService: UserService
  ) { }

  validateFileType(fileInfo) {
    if (fileInfo.mimeType != null && fileInfo.mimeType.indexOf('image') == -1) {
      throw new Error('imageOnly');
    }
    if (fileInfo.mimeType != null && fileInfo.mimeType == 'image/tiff') {
      throw new Error('tiff');
    }
  }

  ngAfterViewInit() {
    const that = this;

    const widget1 = uploadcare.Widget('#files1');
    widget1.onChange(function(value) {
      if (value) {
        value.promise().done(function(info) {
          that.files1 = info.cdnUrl;
          that.files1Count = new Array(info.count);
        });
      } else {
        that.files1 = '';
      }
    });

    const widget2 = uploadcare.Widget('#files2');
    widget2.onChange(function(value) {
      if (value) {
        value.promise().done(function(info) {
          that.files2 = info.cdnUrl;
          that.files2Count = new Array(info.count);
        });
      } else {
        that.files2 = '';
      }
    });
  }

  onSubmit() {
    this.update.emit({
                      'figures': this.files1,
                      'tables': this.files2,
                      'supplements': this.files3
                    });
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
