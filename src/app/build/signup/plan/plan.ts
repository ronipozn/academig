import {Component, Input, Output, NgZone, EventEmitter, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-plan',
  templateUrl: 'plan.html',
  styleUrls: ['plan.css'],
})
export class SignUpBuildPlanComponent {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  // slide: boolean = false;
  // switchSlide(): void {
  //   this.slide=!this.slide;
  // }

  type: number;
  period: number;

  labType: number;

  ngOnInit() {
    this.labType = (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) ? 2 : 1;
  }

  planUpdate(event) {
    this.type = event.type; // Free / PRO / PRO+
    this.period = event.period; // Monthly / Yearly
    this.newStep.emit([]);
  }

  // toStep(): void {
  //   this.newStep.emit([]);
  // }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
