import {Component, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {SupportService} from '../../../../shared/services/support-service';

@Component({
  selector: 'department-request',
  templateUrl: 'request.html',
  styleUrls: ['request.css']
})
export class DepartmentRequestComponent {
  name: string;
  role: string;
  email: string;
  university: string;
  department: string;
  message: string;

  submitFlag = 0;
  submitStatus = false;

  constructor(private titleService: Title,
              private supportService: SupportService) {
    this.titleService.setTitle('Department Request | Academig');
  }

  async contactDepartment() {
    this.name = null;
    this.role = null;
    this.email = null;
    this.university = null;
    this.department = null;
    this.message = null;

    this.submitFlag = 1;

    await this.supportService.putSupport(this.name + 'Role: ' + this.role,
                                         this.email,
                                         6,
                                         this.university + ': ' + this.department,
                                         this.message);

    this.submitFlag = 0;
  }

}
