import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'terms',
  templateUrl: 'terms.html'
})
export class TermsComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Academig Terms');
  }

}
