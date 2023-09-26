import {Component, Inject, Output, EventEmitter} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

interface MentoringDialogData {
  name: string,
  price: number,
  details: string,
}

// https://stackoverflow.com/questions/47952678/how-to-communicate-from-mat-dialog-component-to-the-component-where-mat-dialog-i
// https://stackoverflow.com/questions/47270324/nullinjectorerror-no-provider-for-matdialogref
@Component({
  selector: 'coaching-dialog',
  templateUrl: 'coaching-dialog.html',
  styleUrls: ['coaching-dialog.css']
})
export class CoachingFormDialog {
  @Output() buttonRemoveClick: EventEmitter <boolean> = new EventEmitter();

  streamFlag: boolean = false;
  name: string;
  price: number;
  details: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: MentoringDialogData) {
    this.name = data.name;
    this.price = data.price;
    this.details = data.details;
  }

  onRemove() {
    this.streamFlag = true;
    this.buttonRemoveClick.emit(true);
  }

}
