import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'advertising-guidelines',
  templateUrl: 'advertising-guidelines.html'
})
export class AdvertisingComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Academig Advertising Guidelines');
  }

}
