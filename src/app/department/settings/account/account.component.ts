import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {MissionService} from '../../services/mission-service';
import {departmentAccount, DepartmentService} from '../../../shared/services/department-service';

import {SharedService, Affiliation} from '../../../shared/services/shared-service';

@Component({
  selector: 'settings-account',
  templateUrl: 'account.html',
  styleUrls: ['account.css']
})
export class AccountComponent {
  account: departmentAccount;

  affiliation: Affiliation;
  streamRetrieved: boolean;

  affiliationBuildFlag: boolean;
  streamAffiliation = 0;

  constructor(private router: Router,
              public missionService: MissionService,
              public departmentService: DepartmentService,
              public sharedService: SharedService
             ) { }

  async ngOnInit() {
    this.streamRetrieved = false;
    this.account = await this.departmentService.getDepartmentAccount(this.missionService.departmentId);

    this.streamRetrieved = true;
    this.affiliation = {
                        '_id': this.missionService.departmentId,
                        'title': this.missionService.departmentIndex.department.name,
                        'abbr': this.missionService.departmentIndex.department.link,
                        'description': this.account.description,
                        'source': this.account.source,
                        'externalLink': this.account.externalLink,
                        'pic': this.missionService.departmentIndex.department.pic
                       };
  }

  async toogleStage() {
    await this.sharedService.postStage(this.missionService.departmentId, this.account.stage, 1);
  }

  affiliationSlide(flag: boolean) {
    this.affiliationBuildFlag = flag;
  }

  async affiliationUpdate(event) {
    this.affiliationBuildFlag = false;

    const affiliation: Affiliation = {
                                      '_id': this.affiliation._id,
                                      'title': event.title,
                                      'abbr': event.abbr,
                                      'description': event.description,
                                      'source': event.source,
                                      'externalLink': event.externalLink,
                                      'pic': event.pic
                                     };

    this.affiliation = affiliation;
    this.streamAffiliation = 3;

    await this.sharedService.postAffiliation(affiliation, this.missionService.departmentId, 1);

    this.streamAffiliation = 1;
    this.missionService.departmentIndex.department.name = event.title;
    this.missionService.departmentIndex.department.link = event.abbr;
    this.missionService.departmentIndex.department.pic = event.pic;

    this.missionService.departmentExternalLink = event.externalLink;
    this.missionService.departmentDescription = event.description;
    this.missionService.departmentSource = event.source;
  }

  affiliationStreamFunc() {
    this.streamAffiliation = 0;
    this.router.navigate(['/', this.missionService.departmentIndex.university.link,
                               this.missionService.departmentIndex.department.link,
                               'settings',
                               'account'
                         ]);
  }

}
