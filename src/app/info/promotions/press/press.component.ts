import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'press',
  templateUrl: 'press.html',
  styleUrls: ['press.css']
})
export class PressComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Press | Academig');
  }

}
