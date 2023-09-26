import {Component, Input, Output, NgZone, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-group-privacy',
  templateUrl: 'group-privacy.html',
  styleUrls: ['group-privacy.css']
})
export class SignUpBuildGroupPrivacyComponent {
  @Input() parentGroup: FormGroup;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  title: string;
  acronym: string;
  picBuildFlag = false;

  privacySelect = [{display: 'Full', value: 0},
                   {display: 'Limited', value: 1},
                   ];

  toStep(): void {
    this.newStep.emit([]);
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
