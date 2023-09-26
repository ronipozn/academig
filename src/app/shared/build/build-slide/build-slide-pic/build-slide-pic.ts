import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UserService } from '../../../../user/services/user-service';
import { slideInOutAnimation } from '../../../animations/index';

declare var uploadcare: any;

@Component({
  selector: 'build-slide-pic',
  templateUrl: 'build-slide-pic.html',
  animations: [slideInOutAnimation],
  host: { '[@slideInOutAnimation]': '' },
  styleUrls: ['build-slide-pic.css']
})

export class BuildSlidePicComponent {
  @Input() title: string;
  @Input() itemId: string; // Folder name
  @Input() source = 0; // 0 - typical
                       // 1 - build flow

  @Input() pic: string;
  @Input() name = '';

  @Input() width: number;
  @Input() height: number;
  @Input() type = 1; // 0 - profile
                     // 1 - logo
                     // 3 - cover pic
                     // 4 - PDF (Single)
                     // 6 - CSV (Single)
                     // 7 - CSV (Multiple)

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <string> = new EventEmitter(true);

  constructor(public userService: UserService) { }

  file: string;
  disableFlag: boolean = false;

  ngAfterViewInit() {
    const that = this;
    const widget = uploadcare.Widget('#file');

    if (this.pic && this.pic.substring(0, 16) == 'https://ucarecdn') { widget.value(this.pic); }

    widget.onChange(function(value) {
      if (value) {
        value.promise().done(function(info) {
          that.file = info.cdnUrl;
        });
      } else {
        that.file = '';
      }
    });
  }

  onSubmit() {
    // for (var _i = 0; _i < this.picComponent.responses.length-1; _i++) {
    //   if (this.picComponent.responses[_i].data.delete_token) {
    //     this.picComponent.deleteImage(this.picComponent.responses[_i].data,_i)
    //   }
    // }
    this.disableFlag = true;
    this.update.emit(this.file);
  }

  onCancel() {
    // for (var _i = 0; _i < this.picComponent.responses.length; _i++) {
    //   if (this.picComponent.responses[_i].data && this.picComponent.responses[_i].data.delete_token) {
    //     this.picComponent.deleteImage(this.picComponent.responses[_i].data,_i)
    //   }
    // }
    this.cancel.emit(false);
  }

}
