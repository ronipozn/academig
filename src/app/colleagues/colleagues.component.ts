import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
    selector: 'collegues',
    templateUrl: 'colleagues.html',
    styleUrls: ['colleagues.css'],
})
export class ColleaguesComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Colleagues | Academig');
  }

}
