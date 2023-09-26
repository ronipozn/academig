import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, FormArray} from '@angular/forms';

import {CollaborationService} from '../../../services/collaboration-service';
import {objectMini} from '../../../services/shared-service';

@Component({
  selector: 'build-slide-select-collaborations',
  templateUrl: 'build-slide-select-collaborations.html'
})
export class BuildSlideSelectCollaborationsComponent implements OnInit {
  @Input() itemSmall: boolean;
  @Input() labelHide = false;
  @Input() itemFirst = false;

  @Input() groupId: string;
  @Input() userId: string;
  @Input() title: string;

  @Input() preCollaborationsInput: objectMini[];
  @Input() controlName: string;
  @Input() parentGroup: FormGroup;

  @Output() collaborationsOutput: EventEmitter <objectMini[]> = new EventEmitter(true);

  groups: objectMini[] = [];
  picHover: string = null;
  streamRetrieved: boolean;

  constructor(private collaborationService: CollaborationService) {}

  picHoverFunc(i: number): void {
    this.picHover = (i == -1) ? null : '(' + this.groups[i].name + ')'
  }

  ngOnInit() {
    this.streamRetrieved = false;

    this.parentGroup.addControl(this.controlName, new FormArray([ new FormControl() ]));

    this.collaborationsFunc()
  }

  async collaborationsFunc() {
    this.groups = await this.collaborationService.getCollaborationsMini(this.groupId);

    this.streamRetrieved = true
    this.collaborationsOutput.emit(this.groups);

    const collaborationsForm = this.parentGroup.get(this.controlName) as FormArray;

    for (let _j = 0; _j < this.groups.length; _j++) {
      if (_j > 0) { collaborationsForm.push(new FormControl()); }

      (<FormArray>this.parentGroup.controls[this.controlName])
        .at(_j)
        .setValue(
          (this.preCollaborationsInput[0] == null) ? false :
            (this.preCollaborationsInput.find(p => p._id === this.groups[_j]._id) ? true : false)
        );
    }
  }

}
