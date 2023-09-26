import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {titlesTypes} from '../../../../shared/services/people-service';
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

  @Input() topics: string[];
  @Input() country: string;
  @Input() state: string;
  @Input() city: string;

  titlesTypes = titlesTypes;
  lengthSelect = ['Months', 'Years'];
  typeSelect = ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"];

  topicsSelected: string[] = [];
  topicsSelectedMerge: string;
  date: Date;

  public tableData: TableData;

  constructor() {
    this.date = new Date();

    this.tableData = {
      headerRow: ['', 'Lab', 'Institute', 'Location', 'PI', 'Topic', 'Size', 'Year', ''],
      headerTooltip: ['', 'Lab name', 'Institute and Department', 'Country, State and City', 'Principal investigator', 'Main Research Field', 'Total number of lab members', 'Year of establishment', null],
      headerVisible: [true, true, true, true, true, true, true, true, true],
   };
  }

  ngOnInit() {
    // this.subscription =
    this.secondFormGroup.controls['topic'].valueChanges.subscribe(data => {
      data.forEach((value, index) => {
        this.topicsSelected[index] = this.topics[value]
      })
      this.topicsSelectedMerge = this.topicsSelected.join(', ')
    })
  }
}
