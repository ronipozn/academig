import {Component, Input} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';

@Component({
  selector: 'signup-build-restrict',
  templateUrl: 'restrict.html',
  styleUrls: ['restrict.css']
})
export class SignUpBuildRestrictComponent {
  @Input() userName: string;
  @Input() mode: number = 0;
}
