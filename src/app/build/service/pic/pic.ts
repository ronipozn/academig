import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

declare var uploadcare: any;

@Component({
  selector: 'pic-select',
  templateUrl: 'pic.html',
  styleUrls: ['pic.css']
})
export class PicComponent {
  @Input() parentGroup: FormGroup;
  @Input() acronym: string;
  @Input() control: string;

  uploadFlag: boolean = false;
  file: string;

  constructor() { }

  ngAfterViewInit() {
    const that = this;
    that.uploadFlag = true;

    const widget = uploadcare.Widget('#file');
    widget.onChange(function(value) {
      if (value) {
        value.promise().done(function(info) {
          that.file = info.cdnUrl;
          that.parentGroup.controls[this.control].setValue(info.cdnUrl);
          that.uploadFlag = false;
        });
      } else {
        that.file = '';
      }
    });
  }

  uploadDelete() {
    // https://uploadcare.com/community/t/how-to-clear-the-widget-state-completely-after-upload/842
    const widget = uploadcare.Widget('#file');
    this.file = '';
    this.parentGroup.controls[this.control].setValue(null);
    widget.value(null);
  }

}
