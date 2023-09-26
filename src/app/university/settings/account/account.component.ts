import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {MissionService} from '../../services/mission-service';
import {universityAccount, Rank, UniversityService} from '../../../shared/services/university-service';

import {SharedService, Affiliation} from '../../../shared/services/shared-service';

@Component({
  selector: 'settings-account',
  templateUrl: 'account.html',
  styleUrls: ['account.css']
})
export class AccountComponent {
  account: universityAccount;
  streamRetrieved: boolean;

  affiliation: Affiliation;
  affiliationBuildFlag: boolean;
  streamAffiliation: number = 0;

  rank: Rank
  rankBuildFlag: boolean;
  streamRank: number = 0;

  constructor(private router: Router,
              public missionService: MissionService,
              public universityService: UniversityService,
              public sharedService: SharedService
             ) { }

  async ngOnInit() {
    this.streamRetrieved = false;
    this.account = await this.universityService.getUniversityAccount(this.missionService.universityId);

    this.streamRetrieved = true;
    this.affiliation = {
                        '_id': this.missionService.universityId,
                        'title': this.missionService.universityName,
                        'abbr': this.missionService.universityLink,
                        'description': this.account.description,
                        'source': this.account.source,
                        'externalLink': this.account.externalLink,
                        'pic': this.missionService.universityPic
                       };

    this.rank = this.account.rank;
  }

  async toogleStage() {
    await this.sharedService.postStage(this.missionService.universityId, this.account.stage, 0);
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

    await this.sharedService.postAffiliation(affiliation, this.missionService.universityId, 0);

    this.streamAffiliation = 1;
    this.missionService.universityName = event.title;
    this.missionService.universityLink = event.abbr;
    this.missionService.universityPic = event.pic;

    this.missionService.universityExternalLink = event.externalLink;
    this.missionService.universityDescription = event.description;
    this.missionService.universitySource = event.source;
  }

  affiliationStreamFunc() {
    this.streamAffiliation = 0;
    this.router.navigate(['/', this.missionService.universityLink,
                               'settings',
                               'account'
                         ]);
  }

  async rankOp(mode: number, flag: boolean, rank) {
    this.rankBuildFlag = flag;

    if (mode == 1) {
      this.rank = rank;
      this.streamRank = 3;
      await this.universityService.postRank(rank, this.missionService.universityId, 3);
      this.streamRank = 0;
    }
  }

}
