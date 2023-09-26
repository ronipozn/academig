import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'about',
  templateUrl: 'about.html',
  styleUrls: ['about.css']
})
export class AboutComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('About | Academig');
  }

}
