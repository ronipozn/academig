import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-about',
  templateUrl: 'about.html',
  styleUrls: ['about.css']
})
export class SignUpBuildAboutComponent {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  labType: number;

  toStep(): void {
    this.newStep.emit([]);
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

  ngOnInit() {
    this.labType = (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) ? 1 : 0;
  }

}
