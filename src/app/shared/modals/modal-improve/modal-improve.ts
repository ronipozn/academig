import {Component, Inject, Input, Output, EventEmitter} from '@angular/core';

// interface DialogData {
//   name: string
// }

// https://stackoverflow.com/questions/47952678/how-to-communicate-from-mat-dialog-component-to-the-component-where-mat-dialog-i
// https://stackoverflow.com/questions/47270324/nullinjectorerror-no-provider-for-matdialogref
@Component({
  selector: 'modal-improve',
  templateUrl: 'modal-improve.html',
  styleUrls: ['modal-improve.css']
})
export class ImproveFormDialog {
  @Output() buttonFeedbackClick: EventEmitter <[number, string]> = new EventEmitter();

  type: number;
  message: string;
  disableFlag: boolean = false;

  constructor(
              // @Inject(MAT_DIALOG_DATA) public data: DialogData
              ) {
  }

  onSubmit() {
    this.disableFlag = true;
    this.buttonFeedbackClick.emit([this.type, this.message]);
  }

}
