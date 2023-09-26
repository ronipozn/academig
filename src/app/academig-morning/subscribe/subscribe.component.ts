import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'subscribe',
  templateUrl: 'subscribe.html',
  styleUrls: ['subscribe.css']
})
export class SubscribeComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Academig Morning');
  }
}
