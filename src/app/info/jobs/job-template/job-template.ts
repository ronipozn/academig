import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'description',
  templateUrl: 'job-template.html'
})
export class JobsTemplateComponent {

  constructor(private titleService: Title) {
    this.titleService.setTitle('Job Posting Template | Academig');
  }

}
