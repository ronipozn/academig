import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {serviceTypes} from '../../../../shared/services/resource-service';

import * as moment from 'moment';

export interface TableData {
  headerRow: string[];
  headerTooltip: string[];
  headerVisible: boolean[];
}

@Component({
  selector: 'preview-item',
  templateUrl: 'item.html',
  styleUrls: ['item.css']
})
export class PreviewItemComponent implements OnInit {
  @Input() firstFormGroup: FormGroup;
  @Input() secondFormGroup: FormGroup;

  @Input() country: string;
  @Input() state: string;
  @Input() city: string;

  date: Date;

  tagsSelected: string[] = [];
  tagsSelectedMerge: string;
  categoryType = serviceTypes;

  public tableData: TableData;

  constructor() {
    this.date = new Date();

    this.tableData = {
      headerRow: ['', 'Service', 'Category', 'Provider', 'Location', 'Description', 'Expertise', 'Date', ''],
      headerTooltip: ['', 'Service name', 'Service category', 'Service provider', 'Country, State and City', 'Service Description', 'Service expertise', 'Posting date', null],
      headerVisible: [true, true, true, true, true, true, true, true, true],
   };
  }

  ngOnInit() {
    this.firstFormGroup.controls['tags'].valueChanges.subscribe(data => {
      data.forEach((value, index) => { this.tagsSelected[index] = value })
      this.tagsSelectedMerge = this.tagsSelected.join(', ')
    })
  }
}
