import {Component, Input, Output, EventEmitter} from '@angular/core';

import {groupComplex} from '../../../shared/services/shared-service';

@Component({
    selector: 'group-welcome-modal',
    templateUrl: 'welcome-modal.html',
    styleUrls: ['welcome-modal.css']
})
export class GroupWelcomeModalComponent {
  @Input() piOnBhelafFlag: boolean = false;
  @Input() groupStage: number;
  @Input() groupIndex: groupComplex;
  @Input() onBehalf: number;

  stepNum: number = 0;
  totSteps: number = 0;

  icons: string[] = ['check','feed','rocket','users'];

  labFlag: boolean = true;
  entity: string;

  changeStep(upDown: boolean, updateStep: number) {
    if (updateStep != null) {
      this.stepNum = updateStep;
    } else {
      this.stepNum = (this.stepNum + this.totSteps + (upDown ? 1 : -1)) % this.totSteps;
    }
  }

  closeModalFunc(upDown: boolean, updateStep: number) {
    if (updateStep != null) {
      this.stepNum = updateStep;
    } else {
      this.stepNum = (this.stepNum + this.totSteps + (upDown ? 1 : -1)) % this.totSteps;
    }
  }

  ngOnInit() {
    this.labFlag = !(this.onBehalf==4 || this.onBehalf==5 || this.onBehalf==7);
    this.entity = (this.labFlag) ? 'LAB' : 'COMPANY';
    this.totSteps = (this.labFlag) ? 4 : 3;
    // this.totSteps = this.piOnBhelafFlag ? 5 : 4;
  }
}
