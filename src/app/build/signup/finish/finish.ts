import {Component, OnInit, Input, Output, Directive, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'signup-build-finish',
  templateUrl: 'finish.html',
  styleUrls: ['finish.css']
})
export class SignUpBuildFinishComponent implements OnInit {
  @Input() parentGroup: FormGroup;
  @Input() submitFlag: boolean;
  @Input() userName: string;
  @Input() forkNum: number;

  // @Output() newStep: EventEmitter <number[]> = new EventEmitter();
  @Output() previousStep: EventEmitter <boolean> = new EventEmitter();

  rightsCheckbox: boolean;

  labType: number;

  color = 'primary';
  mode = 'buffer';
  progress = 0;
  bufferValue = 0;

  ngOnInit() {
    this.labType = (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) ? 1 : 0;
  }

  ngOnChanges() {
    const that = this;

    if (this.submitFlag==true) {
      var x = 100, interval = 50;
      for (var i = 0; i < x; i++) {
        setTimeout(function () { ++that.progress }, i * interval)
      }
    }
  }

  toPrevious(): void {
    this.previousStep.emit();
  }

}
