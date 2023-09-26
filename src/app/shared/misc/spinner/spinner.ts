import {Component, Input} from '@angular/core';

@Component({
  selector: 'spinner',
  templateUrl: 'spinner.html',
  styleUrls: ['spinner.css']
})
export class SpinnerComponent {
  @Input() text: string;
  @Input() itemSmall = false;
}
