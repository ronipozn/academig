import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
    selector: 'admin',
    templateUrl: 'admin.html',
    styleUrls: ['admin.css'],
})
export class AdminComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Admin - Academig');
  }

}
