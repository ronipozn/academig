import {Component, Inject, Input, Output, EventEmitter, DoCheck, IterableDiffers} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';

import {ToggleFolder, Folder, Journal} from '../../../shared/services/publication-service';

@Component({
  selector: 'folders-btn',
  templateUrl: 'folders-btn.html',
  styleUrls: ['folders-btn.css']
})
export class FoldersBtnComponent {
  @Input() streamFolder: number;
  @Input() stream: number;
  @Input() disabledFlag: boolean = false;
  @Input() smFlag: boolean = true;
  @Input() sourceType: number;

  @Input() _id: string;
  @Input() title: string;
  @Input() journal: Journal;
  @Input() date: Date;

  @Input() folders: Folder[];
  @Input() userFolders: Folder[];

  @Output() buttonFolderClick: EventEmitter <ToggleFolder> = new EventEmitter();
  @Output() buttonReadAddClick: EventEmitter <boolean> = new EventEmitter();

  differ: any;

  addFlag: boolean = false;
  addFolderName: string;

  status: number = 0;

  isChecked: boolean;

  stickFolders: string[] = ["Want to Read", "Read", "Currently Reading", "Want to Read"]
  stickColors: string[] = [null, "#705360", "#FEC02F", "#40AD58"]
  // stickIcons: string[] = ["bookmark_border", "plus_one", "", "compare", "bookmark_border"]

  foldersNames: string[];

  constructor(private datepipe: DatePipe,
              private differs: IterableDiffers) {
    this.differ = differs.find([]).create(null);
  }

  ngDoCheck() {
    const change = this.differ.diff(this.folders);
    if (change) {
      // console.log('changed',this.folders)
      this.foldersNames = this.folders.map(r => r.folder);
      if (this.foldersNames) this.updateStatus()
    }
  }

  updateStatus() {
    if (this.foldersNames.indexOf("current")>-1) {
      this.status=2;
    } else if (this.foldersNames.indexOf("want")>-1) {
      this.status=3;
    } else if (this.foldersNames.indexOf("read")>-1) {
      this.status=1;
    }
  }

  readAddFunc() {
    this.buttonReadAddClick.emit(true);
  }

  buttonFolderFunc(folder_key: string) {
    this.addFlag = false;
    this.addFolderName = null;

    const folder: ToggleFolder = {
      _id: null,
      checked: true,
      folder: folder_key,
      date: new Date(this.datepipe.transform(new Date(), 'yyyy-MM-dd')),
      end: null,
      summary: null,
      privacy: null,
      rating: null,
      recommend: null,
      recommended: null,
      feed: null
    }

    this.buttonFolderClick.emit(folder);
  }

  userFolderFunc(isChecked: boolean, i: number) {
    // .replace(/ /g,"_").toLowerCase();
    const folder: ToggleFolder = {
      _id: null,
      checked: isChecked,
      folder: this.userFolders[i].folder,
      date: new Date(this.datepipe.transform(new Date(), 'yyyy-MM-dd')),
      end: null,
      summary: null,
      privacy: null,
      rating: null,
      recommend: null,
      recommended: null,
      feed: null
    }

    this.buttonFolderClick.emit(folder);
  }

}
