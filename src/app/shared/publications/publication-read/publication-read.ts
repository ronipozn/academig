import {Component, Inject, Input, Output, EventEmitter, DoCheck, IterableDiffers} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {ToggleFolder, Folder, Journal, Publication} from '../../services/publication-service';
import {ReadFormDialog} from '../../buttons/folders-btn/read-form-dialog';

@Component({
  selector: 'publication-read',
  templateUrl: 'publication-read.html',
  styleUrls: ['publication-read.css']
})
export class PublicationReadComponent {
  @Input() folders: Folder[];

  @Input() title: string;
  @Input() journal: Journal;
  @Input() date: Date;

  @Input() showEditBtn: boolean;

  @Output() btnReadEdit: EventEmitter <number> = new EventEmitter();
  @Output() btnReadRemove: EventEmitter <number> = new EventEmitter();

  differ: any;

  DialogRef: MatDialogRef<ReadFormDialog>;

  constructor(
    // private differs: IterableDiffers,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<ReadFormDialog>) {
    // this.differ = differs.find([]).create(null);
  }

  // ngDoCheck() {
  //   const change = this.differ.diff(this.folders);
  //   if (change) {
  //     console.log('changed',this.folders)
  //     // this.foldersNames = this.folders.map(r => r.folder);
  //     // if (this.foldersNames) this.updateStatus()
  //   }
  // }

  readEditFunc(i: number) {
    this.btnReadEdit.emit(i);
  }

  readRemoveFunc(i: number) {
    this.DialogRef = this.dialog.open(ReadFormDialog, {
      data: {
        title: this.title,
        journal: this.journal,
        date: this.date,
        mode: 2
      }
    });

    const dialogSubmitSubscription = this.DialogRef.componentInstance.buttonRemoveClick.subscribe(folder => {
      dialogSubmitSubscription.unsubscribe();
      this.btnReadRemove.emit(i);
      this.DialogRef.close();
    });
  }

}
