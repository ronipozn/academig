import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { AuthService } from '../../../../auth/auth.service';

import { UserService } from '../../../../user/services/user-service';

import { Gallery } from '../../../../shared/services/gallery-service';

import { slideInOutAnimation } from '../../../../shared/animations/index';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-gallery',
    templateUrl: 'build-slide-gallery.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-gallery.css']
})

export class BuildSlideGalleryComponent {
  @Input() newFlag: boolean;
  @Input() groupId: string;
  @Input() gallery: Gallery;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus: boolean = false;
  disableFlag: boolean = false;
  formModel: FormGroup;

  fileGroup: string;
  filesCount: number[] = [];

  adminFlag: boolean = false;

  constructor(
    private datepipe: DatePipe,
    public userService: UserService,
    private authService: AuthService
  ) {
    this.formModel = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      date: new FormControl(this.datepipe.transform(new Date(), 'yyyy-MM'))
    });
  }

  ngOnInit() {
    this.authService.token.subscribe(token => {

      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])

      if (this.newFlag) {
        this.formModel.addControl('name', new FormArray([new FormControl()]));
        if (this.adminFlag) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
      } else {
        this.formModel.setValue({
          title: this.gallery.title,
          description: this.gallery.description,
          date: this.datepipe.transform(this.gallery.date, 'yyyy-MM'),
        });
      };

    });
  }

  validateFileType(fileInfo) {
    if (fileInfo.mimeType != null && fileInfo.mimeType.indexOf('image') == -1) {
      throw new Error('imageOnly');
    }
    if (fileInfo.mimeType != null && fileInfo.mimeType == 'image/tiff') {
      throw new Error('tiff');
    }
  }

  ngAfterViewInit() {
    if (this.newFlag) {
      const that = this;
      const widget = uploadcare.Widget('#fileGroup');

      widget.validators.push(that.validateFileType);

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
  }

  onSubmit() {
    if (this.formModel.valid) {

      this.disableFlag = true;
      this.update.emit({'intelligence': (this.adminFlag) ? this.formModel.value.intelligence[0] : 0,
                        'groupPics': this.fileGroup,
                        'title': this.formModel.value.title,
                        'description': this.formModel.value.description,
                        'date': this.formModel.value.date,
                       });
    } else {

      this.submitStatus = !this.submitStatus;

    }
  }

  onCancel() {
    // if (this.picComponent) {
    //   for (var _i = 0; _i < this.picComponent.responses.length; _i++) {
    //     if (this.picComponent.responses[_i].data.delete_token) {
    //       this.picComponent.deleteImage(this.picComponent.responses[_i].data,_i)
    //     }
    //   }
    // };

    this.cancel.emit(false);
  }

}
