import {Component, Inject, Input, Output, EventEmitter, DoCheck, IterableDiffers} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {Journal} from '../../../shared/services/publication-service';

interface ReadDialogData {
  title: string,
  journal: Journal,
  date: Date,
  folderId: string,
  summary: string,
  privacy: number,
  start: Date,
  end: Date,
  mode: number
}

// https://stackoverflow.com/questions/47952678/how-to-communicate-from-mat-dialog-component-to-the-component-where-mat-dialog-i
// https://stackoverflow.com/questions/47270324/nullinjectorerror-no-provider-for-matdialogref
@Component({
  selector: 'read-form-dialog',
  templateUrl: 'read-form-dialog.html',
  styleUrls: ['read-form-dialog.css']
})
export class ReadFormDialog {
  @Output() buttonRemoveClick: EventEmitter <boolean> = new EventEmitter();

  streamFlag: boolean = false;
  folderId: string;

  constructor(
              //public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: ReadDialogData) {
    if (data.mode==1) this.folderId = data.folderId;
  }

  // this.dialog.closeAll();
  onRemove() {
    this.streamFlag = true;
    this.buttonRemoveClick.emit(true);
  }

}
