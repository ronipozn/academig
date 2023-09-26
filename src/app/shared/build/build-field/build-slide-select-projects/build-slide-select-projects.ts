import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {FormGroup, FormControl, FormArray} from '@angular/forms';

import {objectMini} from '../../../services/shared-service';
import {ProjectService} from '../../../services/project-service';

@Component({
  selector: 'build-slide-select-projects',
  templateUrl: 'build-slide-select-projects.html'
})
export class BuildSlideSelectProjectsComponent implements OnInit {
  @Input() itemSmall: boolean;
  @Input() labelHide = false;
  @Input() itemFirst = false;

  @Input() groupId: string;
  @Input() userId: string;
  @Input() title: string;

  @Input() preProjectsInput: objectMini[];
  @Input() controlName: string;
  @Input() parentGroup: FormGroup;

  @Output() projectsOutput: EventEmitter <objectMini[]> = new EventEmitter(true);

  projects: objectMini[] = [];
  picHover: string = null;
  streamRetrieved: boolean;

  constructor(private projectService: ProjectService) {}

  // checkboxClick(i: number) {
  //   console.log('asd',<FormArray>this.parentGroup.controls[this.controlName].value[i])
  // }

  ngOnInit() {
    this.streamRetrieved = false;

    this.parentGroup.addControl(this.controlName,
      new FormArray([
        new FormControl()
      ]),
    );

    this.projectsFunc()
  }

  picHoverFunc(i: number): void {
    this.picHover = (i == -1) ? null : '(' + this.projects[i].name + ')'
  }

  async projectsFunc() {
    this.projects = await this.projectService.getProjects(2, this.groupId, 2, 1);

    this.streamRetrieved = true;
    this.projectsOutput.emit(this.projects);

    const projectsForm = this.parentGroup.get(this.controlName) as FormArray;
    for (let _j = 0; _j < this.projects.length; _j++) {

      if (_j > 0) { projectsForm.push(new FormControl()); }

      (<FormArray>this.parentGroup.controls[this.controlName])
        .at(_j)
        .setValue(
          (this.preProjectsInput[0] == null) ? false :
            (this.preProjectsInput.find(p => p._id === this.projects[_j]._id) ? true : false)
        );

    }

  }

}
