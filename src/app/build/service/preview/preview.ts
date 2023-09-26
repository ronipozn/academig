import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'preview',
  templateUrl: 'preview.html',
  styleUrls: ['preview.css']
})
export class PreviewComponent {
  @Input() firstFormGroup: FormGroup;
  @Input() secondFormGroup: FormGroup;
  @Input() groupId: string;

  @Input() detailsPreview: any;
  @Input() topics: string[];
}
