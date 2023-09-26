import {Component, Input, OnInit, OnChanges, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'dots-nav',
    templateUrl: 'dots-nav.html',
    styleUrls: ['dots-nav.css']
})
export class DotsNavComponent implements OnInit, OnChanges {
  @Input() stepNum: number;
  @Input() stepsInvalid: boolean[];
  @Input() stepTotal: number;
  @Input() cyclic = false;

  @Output() stepChange: EventEmitter <number> = new EventEmitter();

  boundNum: number;
  stepArr: number[];

  constructor() {}

  ngOnInit() {
    this.boundNum = 0;
    this.stepArr = new Array(this.stepTotal);
  }

  ngOnChanges() {
    if (this.stepNum > this.boundNum) {
      this.boundNum = this.stepNum;
    }
  }

  moveRadioStep(event: number) {
    this.stepChange.emit(event);
    // console.log("bound: " + this.boundNum + ".step: " + this.stepNum)
  }

}
