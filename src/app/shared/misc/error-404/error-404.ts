import {Component, Input} from '@angular/core';

@Component({
  selector: 'error-404',
  templateUrl: 'error-404.html',
  styleUrls: ['error-404.css']
})
export class Error404Component {
  @Input() source: number;
  // 0 - group
  // 1 - wall
  // 2 - department
  // 3 - university
  // 4 - profile
}
