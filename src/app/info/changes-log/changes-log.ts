import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'changes-log',
  templateUrl: 'changes-log.html',
  styleUrls: ['changes-log.css']
})
export class ChangesLogComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Changes Log | Academig');
  }

}
