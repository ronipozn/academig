import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {FormGroup, FormControl, Validators} from '@angular/forms';

import {CreateUniversity, UniversityQuery, AdminService} from '../../../shared/services/admin-service';
import {UniversityService} from '../../../shared/services/university-service';

import {complexName, Countries} from '../../../shared/services/shared-service';
import {UserService} from '../../../user/services/user-service';

@Component({
    selector: 'universities',
    templateUrl: 'universities.html'
})
export class UniversitiesQueryComponent implements OnInit {
  streamRetrievedUniversities: boolean;
  streamRetrieved: boolean[] = [true, true];

  universityBuildFlag: boolean = false;
  universityIndex: number;

  count: number;

  universities: UniversityQuery[] = [];

  newUniversity: complexName;

  countries = Countries;

  formModel: FormGroup;

  @ViewChild('toggleDeleteModal', { static: true }) toggleDelete: ElementRef;

  constructor(private titleService: Title,
              private userService: UserService,
              private adminService: AdminService,
              private universityService: UniversityService) {
    this.titleService.setTitle('Admin Universities - Academig');
  }

  ngOnInit() {
    this.formModel = new FormGroup({
      text: new FormControl(''),
      country: new FormControl(''),
      added: new FormControl(false)
    });

    this.updateList();
  }

  async universityBuild(createUniveristy: CreateUniversity) {
    this.universityBuildFlag = false;
    // this.streamRetrieved[0] = false;

    if (this.universityIndex) {
      this.universities[this.universityIndex].name = createUniveristy.name;
      this.universities[this.universityIndex].url = createUniveristy.url;
      this.universities[this.universityIndex].country_id = createUniveristy.country_id;
    }

    const result = await this.adminService.putUniversityQuery(createUniveristy);

    if (this.universityIndex) this.universities[this.universityIndex].academigId = result;
  }

  async universityDelete(mode: number, i: number = 0) {
    this.toggleDelete.nativeElement.click();

    if (mode==0) {
      this.universityIndex = i;
    } else if (mode==1) {
      // this.streamRetrieved[1] = true;
      // console.log('111',this.universities[this.universityIndex]._id)
      const result = await this.adminService.deleteUniversityQuery(this.universities[this.universityIndex]._id);
      // const result = await this.universityService.deleteUniversity(this.universities[this.universityIndex]._id);
      if (this.universityIndex) this.universities[this.universityIndex].academigId = result
      this.universities.splice(this.universityIndex,1)
    }
  }

  async updateList() {
    this.streamRetrievedUniversities = false;

    const universities = await this.adminService.getUniversitiesQuery(this.formModel.value.text, this.formModel.value.country, this.formModel.value.added ? 1 : 0);

    this.universities = universities;
    this.count = Number(this.universities[this.universities.length - 1]);
    this.universities.pop();
    this.streamRetrievedUniversities = true;
  }

  universitySlide(flag: boolean, i: number = 0) {
    this.universityBuildFlag = flag;
    this.universityIndex = i;

    if (i==null) {
      this.newUniversity = {
        "_id": null,
        "name": null,
        "pic": null,
        "link": null,
      }
    } else{
      this.newUniversity = {
        "_id": this.universities[this.universityIndex]._id,
        "name": this.universities[this.universityIndex].name,
        "pic": null,
        "link": this.universities[this.universityIndex].url,
      }
    }

  }

}
