import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-pro-mentoring',
  templateUrl: 'mentoring.html',
  styleUrls: ['mentoring.css']
})
export class SignUpBuildMentoringComponent {
  @Input() parentGroup: FormGroup;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  toStep(): void {
    this.newStep.emit([]);
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
