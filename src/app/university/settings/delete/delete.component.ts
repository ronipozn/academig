import {Component, Input, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Router, ActivatedRoute} from '@angular/router';

import {departmentsItems, UniversityService} from '../../../shared/services/university-service';
import {MissionService} from '../../services/mission-service';

import {objectMini} from '../../../shared/services/shared-service';

@Component({
  selector: 'settings-delete',
  templateUrl: 'delete.html'
})
export class DeleteComponent implements OnInit {
  departmentsLength: number;
  streamRetrieved: boolean;
  streamDelete = true;

  constructor(public router: Router,
              public activatedRoute: ActivatedRoute,
              public missionService: MissionService,
              private universityService: UniversityService) {}

  ngOnInit() {
    if (this.missionService.universityId) this.getDepartments();
  }

  async getDepartments() {
    this.streamRetrieved = false;

    const departmentsItems: departmentsItems = await this.universityService.getUnitsAndDepartments(this.missionService.universityId);

    this.streamRetrieved = true;
    this.departmentsLength = departmentsItems.departments.length;
  }

  async deleteFunc() {
    this.streamDelete = false;

    await this.universityService.deleteUniversity(this.missionService.universityId);

    this.streamDelete = true;
    this.router.navigate(['/'], { relativeTo: this.activatedRoute });
  }

}
