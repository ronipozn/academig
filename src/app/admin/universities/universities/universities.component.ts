import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {FormGroup, FormControl, Validators} from '@angular/forms';

import {UserService} from '../../../user/services/user-service';
import {UniversityAdmin, AdminService} from '../../../shared/services/admin-service';
import {Countries} from '../../../shared/services/shared-service';

@Component({
    selector: 'universities',
    templateUrl: 'universities.html'
})
export class UniversitiesComponent implements OnInit {
  universities: UniversityAdmin[] = [];
  streamRetrievedUniversities: boolean;

  countries = Countries;

  formModel: FormGroup;

  count: number;

  constructor(private titleService: Title,
              private userService: UserService,
              private adminService: AdminService) {
    this.titleService.setTitle('Admin Universities | Academig');
  }

  ngOnInit() {
    this.formModel = new FormGroup({
      text: new FormControl(''),
      country: new FormControl(''),
      added: new FormControl(false)
    });

    this.updateList();
  }

  async updateList() {
    this.streamRetrievedUniversities = false;

    const universities = await this.adminService.getUniversities(this.formModel.value.text, this.formModel.value.country, 0);

    this.universities = universities;
    this.count = Number(this.universities[this.universities.length - 1]),
    this.universities.pop(),
    this.streamRetrievedUniversities = true;
  }

}
