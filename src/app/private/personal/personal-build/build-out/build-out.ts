import {Component, Input, OnInit} from '@angular/core';
import {FormGroup, FormArray, FormControl, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';

import {ValidatorsService} from '../../../../shared/services/shared-service';
import {Vacation} from '../../../../shared/services/private-service';

@Component({
  selector: 'build-out',
  templateUrl: 'build-out.html',
  styleUrls: ['build-out.css']
})
export class PrivatePersonalOutBuildComponent implements OnInit {
  @Input() vacations: Vacation[];

  @Input() parentGroup: FormGroup;
  @Input() controlName: string;
  @Input() submitStatus: boolean;

  constructor(
    private datepipe: DatePipe,
    private validatorsService: ValidatorsService) {}

  ngOnInit() {
    this.parentGroup.addControl(this.controlName, new FormArray([]));
    if (this.vacations[0]) {
      this.vacations.forEach((vacation) => {
        this.addField(vacation)
      });
    }
  }

  addField(vacation: Vacation) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;

    fieldNames.push(
      new FormGroup({
        where: new FormControl(vacation ? vacation.where : null),

        start: new FormControl(vacation ? this.datepipe.transform(vacation.start, 'yyyy-MM-dd') : null, [this.validatorsService.rangeValidator({'range': ''}), Validators.required]),

        end: new FormControl(vacation ? this.datepipe.transform(vacation.end, 'yyyy-MM-dd') : null, [this.validatorsService.rangeValidator({'range': ''}), Validators.required])

      })
    );

    fieldNames.controls[fieldNames.length - 1].get('start').valueChanges.subscribe((value: string) => {
      fieldNames.controls[fieldNames.length - 1].get('end').updateValueAndValidity({emitEvent: false});
    });

    fieldNames.controls[fieldNames.length - 1].get('end').valueChanges.subscribe((value: string) => {
      fieldNames.controls[fieldNames.length - 1].get('start').updateValueAndValidity({emitEvent: false});
    });

  }

  deleteField(i: number) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;

    fieldNames.removeAt(i);

  }

  getControls(outForm) {
    return outForm.get(this.controlName).controls
  }

}
