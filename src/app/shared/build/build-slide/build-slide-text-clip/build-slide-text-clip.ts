import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import {SharedService} from '../../../../shared/services/shared-service';
import {slideInOutAnimation} from '../../../animations/index';

@Component({
    selector: 'build-slide-text-clip',
    templateUrl: 'build-slide-text-clip.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-text-clip.css']
})

export class BuildSlideTextClipComponent implements OnInit {
  @Input() title: string;
  @Input() text: string;
  @Input() clip: string;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;

  html: string;
  url: any;
  urlValid = false;

  constructor(
    private sanitizer: DomSanitizer,
    private sharedService: SharedService
  ) {
    this.formModel = new FormGroup({
      text: new FormControl('', Validators.required),
      clip: new FormControl(''),
    });
  }

  ngOnInit() {
    this.formModel.controls['text'].setValue(this.text);
    this.formModel.controls['clip'].setValue(this.clip);
    this.controlStatusFunc(null, 1)
  }

  onSubmit() {
    if (this.formModel.valid) {
      // this.formModel.value.clip = this.html;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  controlStatusFunc(event, i: number) {
    if (i == 1) {
      this.html = this.formModel.value.clip ? this.sharedService.convertMedia(this.formModel.value.clip) : '';
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.html);
      this.urlValid = (this.html == '') ? false : true;
    }
  }
}
