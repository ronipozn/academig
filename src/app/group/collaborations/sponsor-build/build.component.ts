import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CustomValidators } from 'ng2-validation';

import { objectMini, ValidatorsService } from '../../../shared/services/shared-service';
import { Sponsor } from '../../../shared/services/collaboration-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

@Component({
    selector: 'sponsor-build',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class GroupCollaborationsSponsorBuildComponent implements OnInit {
  @Input() modeNum: number;
  @Input() groupId: string;
  @Input() userId: string;
  @Input() newFlag: boolean;

  @Input() sponsor: Sponsor;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;

  projects: objectMini[] = [];
  preProjects: objectMini[] = [];

  sponsorType = ['Active Industry Sponsor', 'Active Government Sponsor']

  constructor(
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private router: Router,
    private validatorsService: ValidatorsService
  ) {
    this.formModel = new FormGroup({
      name: new FormControl('', Validators.required),
      link: new FormControl('', CustomValidators.url),
      single: new FormArray([
        new FormControl(false)
      ]),
    });
  }

  ngOnInit() {
    if (!this.newFlag) {
      this.formModel.setValue({
        name: this.sponsor.name,
        link: this.sponsor.link,
        single: [this.sponsor.period ? (this.sponsor.period.mode == 2) : false]
      });

      this.formModel.controls['link'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['link'].setValue(value.trim(), {emitEvent: false});
      });

      this.preProjects = this.sponsor.projects;
    }

    this.formModel.addControl('start', this.newFlag ?
                              new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                              new FormControl(this.datepipe.transform(this.sponsor.period.start, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

    this.formModel.addControl('end', this.newFlag ?
                              new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                              new FormControl(this.datepipe.transform(this.sponsor.period.end, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

    this.formModel.controls['start'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['end'].updateValueAndValidity({emitEvent: false});
    });

    this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
    });

    this.controlStatusFunc(false, );
  }

  controlStatusFunc(event) {
    if (event == false) {
      this.formModel.get('single').value[0] ?
        this.formModel.get('end').disable() : this.formModel.get('end').enable();
    }
  }

  onSubmit() {
    this.formModel.value.projects = this.projects.filter((elem, index, arr) => this.formModel.value.projects[index] === true);

    if (this.formModel.valid) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  projectsFunc(event) {
    this.projects = event;
  }

}
