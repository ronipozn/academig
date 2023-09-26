import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'copyright',
  templateUrl: 'copyright.html'
})
export class CopyrightComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Academig Copyright');
  }

}
