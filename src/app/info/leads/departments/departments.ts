import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

@Component({
  selector: 'departments',
  templateUrl: 'departments.html',
  styleUrls: ['departments.css']
})
export class DepartmentsComponent {

  constructor(private titleService: Title,
              private router: Router) {
    this.titleService.setTitle('For Departments | Academig');
  }

  pricingClick() {
    this.router.navigate(['/pricing'], { fragment: 'departments' });
  }

}
