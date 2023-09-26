import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {titlesTypes} from '../../../../shared/services/people-service';
import * as moment from 'moment';

@Component({
  selector: 'preview-details',
  templateUrl: 'details.html',
  styleUrls: ['details.css']
})
export class PreviewDetailsComponent {
  @Input() firstFormGroup: FormGroup;
  @Input() secondFormGroup: FormGroup;
  @Input() detailsPreview: any;

  // position: OpenPositionDetails;
  // textTitles: string[] = ['Description', 'Duties and Tasks', 'Employer and Scholarship', 'Expectations', 'Education', 'Experience and Skills'];

  titlesTypes = titlesTypes;
  lengthSelect = ['Months', 'Years'];
  typeSelect = ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"];
  currencySelect = ['Dollar', 'Euro', 'Pound', 'Shekel', 'Won', 'Ruble', 'Rupee', 'Yen', 'Yuan'];
  gradesTitles: string[] = ['GPA', 'GRE', 'TOEFL'];
  lettersTitles: string[] = ['Curriculum vitae', 'Letter of motivation', 'Letter of interest', 'Cover letter', 'Project proposal', 'Teaching statement'];

  date: Date;

  constructor() {
    this.date = new Date();
  }
}
