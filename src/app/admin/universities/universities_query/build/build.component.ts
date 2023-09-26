import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../../../shared/animations/index';
import { CustomValidators } from 'ng2-validation';

import {Subscription} from 'rxjs/Subscription';

declare var uploadcare: any;

import {AdminService} from '../../../../shared/services/admin-service';
import {complexName, Countries} from '../../../../shared/services/shared-service';

@Component({
    selector: 'university-build',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class UniversityBuildComponent implements OnInit {
  subscription: Subscription;

  @Input() university: complexName;
  @Input() country_id: number;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;

  uploadFlag = false;

  file: string;

  universityId: string = null;

  countries = Countries;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    var abbr = this.university.name ? this.university.name.replace(/ /g,"_").toLowerCase() : '';

    this.formModel = new FormGroup({
      name: new FormControl(this.university.name, Validators.required),
      link: new FormControl(abbr, Validators.required),
      url: new FormControl(this.university.link, [Validators.required, CustomValidators.url]),
      state: new FormControl(''),
      city: new FormControl('',Validators.required),
      country_id: new FormControl(this.country_id, Validators.required),
      description: new FormControl('', Validators.required),
      source: new FormControl('', Validators.required),
    });

    this.formModel.controls['url'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['url'].setValue(value.trim(), {emitEvent: false});
    });

    // this.subscription = this.adminService.queryWikipedia(this.name, null).subscribe(
    //   result => console.log('rrr,',result),
    //   err => { },
    //   () => { }
    // );

  }

  ngAfterViewInit() {
    const that = this;
    that.uploadFlag = true;

    const widget = uploadcare.Widget('#file');
    widget.onChange(function(value) {
      if (value) {
        value.promise().done(function(info) {
          that.file = info.cdnUrl;
          that.uploadFlag = false;
        });
      } else {
        that.file = '';
      }
    });
  }

  onSubmit() {
    this.formModel.value.pic = this.file;

    if (this.formModel.valid) {
      this.formModel.value._id = this.university._id
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  abbrGenerate() {
    const value: string = this.formModel.controls['name'].value;
    const link: string = value ? value.replace(/ /g,"_").toLowerCase() : '';
    this.formModel.controls['link'].setValue(link);
  }

}
