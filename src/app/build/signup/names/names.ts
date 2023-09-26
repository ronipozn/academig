import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-names',
  templateUrl: 'names.html',
  styleUrls: ['names.css']
})
export class SignUpBuildNamesComponent {
  @Input() parentGroup: FormGroup;
  @Input() userName: string;
  @Input() forkNum: number;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  toStep(): void {
    this.newStep.emit([]);
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
