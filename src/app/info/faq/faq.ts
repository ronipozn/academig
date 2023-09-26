import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'faq',
  templateUrl: 'faq.html'
})
export class FaqComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Frequently Asked Questions | Academig');
  }

}
