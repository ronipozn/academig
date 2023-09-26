import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'legal',
  templateUrl: 'legal.html',
  styleUrls: ['legal.css']
})
export class LegalComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Legal | Academig');
  }

}
