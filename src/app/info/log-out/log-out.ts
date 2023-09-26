import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'log-in',
  templateUrl: 'log-out-pi.html',
  styleUrls: ['log-out.css']
})
export class LogOutComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Log Out | Academig');
  }

}
