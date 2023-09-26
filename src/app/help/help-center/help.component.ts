import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'help',
  templateUrl: 'help.html',
  styleUrls: ['help.css']
})
export class HelpCenterComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Help Center | Academig');
  }

}
