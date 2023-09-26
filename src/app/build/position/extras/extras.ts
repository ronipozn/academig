import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'extras',
  templateUrl: 'extras.html',
  styleUrls: ['extras.css']
})
export class ExtrasComponent {
  @Input() parentGroup: FormGroup;
  @Input() prices: number[];
}
