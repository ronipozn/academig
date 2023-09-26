import {Component, Input, OnInit, EventEmitter} from '@angular/core';
import {FormGroup, FormArray, FormControl} from '@angular/forms';
import {DatePipe} from '@angular/common';

import {Position, titleSelect} from '../../../../shared/services/people-service';

@Component({
  selector: 'build-positions',
  templateUrl: 'build-positions.html',
  styleUrls: ['build-positions.css']
})
export class GroupPeoplePositionsBuildComponent implements OnInit {
  @Input() itemTitle: string;
  @Input() itemSmall = false;

  @Input() parentGroup: FormGroup;
  @Input() controlName: string;

  @Input() positions: Position[];

  activeIndex = -1;

  titleSelect = titleSelect;

  constructor(
    private datepipe: DatePipe,
  ) {}

  ngOnInit() {
    this.parentGroup.addControl(this.controlName,
      new FormArray([
      ])
    );

    this.positions.forEach((position) => {
      this.addField(position)
    });
  }

  addField(position: Position) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;

    // only one active position is allowed
    // if (position) {
    //   this.activeFlag = (position.period.mode==1) || this.activeFlag;
    // }

    fieldNames.push(
      new FormGroup({
        start: new FormControl(position ? this.datepipe.transform(position.period.start, 'yyyy-MM') : null),

        end: new FormControl(position ? this.datepipe.transform(position.period.end, 'yyyy-MM') : null),

        present: new FormArray([new FormControl(position ? (position.period.mode == 1) : false)]),

        titles: new FormControl(position ? position.titles[0] : 301),
      })
    );

    this.controlStatusFunc(fieldNames.length - 1)
  }

  deleteField(i: number) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;

    // only one active position is allowed
    this.activeIndex = (fieldNames.controls[i].get('present').value[0] == true) ? -1 : this.activeIndex;

    fieldNames.removeAt(i);
  }

  controlStatusFunc(i: number) {
    const fieldNames = this.parentGroup.get(this.controlName) as FormArray;

    // console.log('qwqwqw',fieldNames.controls[i].get('present').value[0])

    fieldNames.controls[i].get('present').value[0] ?
    (
     fieldNames.controls[i].get('end').disable(),
     this.activeIndex = i
    ) : (
     fieldNames.controls[i].get('end').enable(),
     this.activeIndex = (this.activeIndex == i) ? -1 : this.activeIndex
    )

    // fieldNames.controls.forEach((position,index) => {
    //   console.log('index',index)
    //   if (index!=i) fieldNames.controls[index].get('present').enable()
    // })

  }

  getControls(periodForm) {
    // FIX: this function get called a lot. Is it OK?
    return periodForm.get(this.controlName).controls
  }

}
