import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-group-people',
  templateUrl: 'group-people.html',
  styleUrls: ['group-people.css']
})
export class SignUpBuildGroupPeopleComponent {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;
  @Input() userId: string;
  @Input() userPic: string;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  submitStatus: number = 0;

  tagsUpdate(tags: any[]) {
    this.parentGroup.controls['preMembers'].setValue(tags)
    this.newStep.emit([]);
  }

  toStep(): void {
    this.submitStatus += 1;
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
