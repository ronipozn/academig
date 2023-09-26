import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, FormArray} from '@angular/forms';

import {objectMini} from '../../../services/shared-service';
import {FundingService} from '../../../services/funding-service';

@Component({
  selector: 'build-slide-select-fundings',
  templateUrl: 'build-slide-select-fundings.html'
})
export class BuildSlideSelectFundingsComponent implements OnInit {
  @Input() itemSmall: boolean;
  @Input() labelHide = false;
  @Input() itemFirst = false;

  @Input() groupId: string;
  @Input() userId: string;
  @Input() title: string;

  @Input() preFundingsInput: objectMini[];
  @Input() controlName: string;
  @Input() parentGroup: FormGroup;

  @Output() fundingsOutput: EventEmitter <objectMini[]> = new EventEmitter(true);

  fundings: objectMini[] = [];
  picHover: string = null;
  streamRetrieved: boolean;

  constructor(private fundingService: FundingService) {}

  picHoverFunc(i: number): void {
    this.picHover = (i == -1) ? null : '(' + this.fundings[i].name + ')'
  }

  ngOnInit() {
    this.streamRetrieved = false;

    this.parentGroup.addControl(this.controlName,
      new FormArray([
        new FormControl()
      ]),
    );

    this.fundingsFunc()
  }

  async fundingsFunc() {
    this.fundings = await this.fundingService.getFundings(this.groupId, 0, 0, 1);

    this.streamRetrieved = true;
    this.fundingsOutput.emit(this.fundings);
    const fundingsForm = this.parentGroup.get(this.controlName) as FormArray;

    for (let _j = 0; _j < this.fundings.length; _j++) {
      if (_j > 0) { fundingsForm.push(new FormControl()); }

      (<FormArray>this.parentGroup.controls[this.controlName])
        .at(_j)
        .setValue(
          (this.preFundingsInput[0] == null) ? false :
            (this.preFundingsInput.find(p => p._id === this.fundings[_j]._id) ? true : false)
        );
    }
  }

}
