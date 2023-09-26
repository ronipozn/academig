import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'cancel',
  templateUrl: 'cancel.html',
  styleUrls: ['cancel.css']
})
export class CancelComponent {
  @Input() parentGroup: FormGroup;
}
