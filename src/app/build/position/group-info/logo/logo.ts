import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

declare var uploadcare: any;

@Component({
  selector: 'group-logo',
  templateUrl: 'logo.html',
  styleUrls: ['logo.css']
})
export class GroupLogoComponent {
  @Input() parentGroup: FormGroup;
  @Input() acronym: string;

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
          that.parentGroup.controls['logo'].setValue(info.cdnUrl);
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
    this.parentGroup.controls['logo'].setValue(null);
    widget.value(null);
  }

}
