import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-pi-info',
  templateUrl: 'pi-info.html',
  styleUrls: ['pi-info.css']
})
export class SignUpBuildPIInfoComponent {
  @Input() parentGroup: FormGroup;
  @Input() forkNum: number;
  @Input() userPic: string;

  @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();
  @Output() picSlide: EventEmitter <boolean> = new EventEmitter();

  labType: number;

  positionSelect = [{display: 'Full Professor', value: 100},
                    {display: 'Associate Professor', value: 101},
                    {display: 'Assistant Professor', value: 102},
                    {display: 'Professor Emeritus', value: 103},
                   ];

  errorFlag: boolean[] = [false, false, false];

  ngOnInit() {
    this.labType = (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) ? 1 : 0;
  }

  onClick(i: number): void {
    this.errorFlag[i] = false;
  }

  picOp() {
    this.picSlide.emit()
  }

  toStep(): void {
    this.errorFlag = [false, false, false];

    if (this.parentGroup.get('secondPosition').invalid) {
      this.errorFlag[0] = true;
    }

    if (this.parentGroup.get('secondName').invalid) {
      this.errorFlag[1] = true;
    }

    if (this.parentGroup.get('secondStartDate').invalid) {
      this.errorFlag[2] = true;
    }

    // console.log('errorFlag',this.errorFlag)

    if (this.errorFlag[0] == false && this.errorFlag[1] == false && this.errorFlag[2] == false) {
      this.newStep.emit([]);
    }
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
