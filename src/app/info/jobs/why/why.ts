import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'why',
  templateUrl: 'why.html'
})
export class JobsWhyComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Why Academig Jobs | Academig');
  }

}
