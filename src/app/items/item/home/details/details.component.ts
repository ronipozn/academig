import {Component, Input} from '@angular/core';

import {objectMini, PublicInfo, SocialInfo} from '../../../../shared/services/shared-service';
import {PodcastType, EventType, ProductType} from '../../../services/item-service';

import {SharedService} from '../../../../shared/services/shared-service';
import {MissionService} from '../../../services/mission-service';

@Component({
  selector: 'item-details',
  templateUrl: 'details.html',
  styleUrls: ['details.css']
})
export class DetailsComponent {
  @Input() shortDescription: string;
  @Input() type: number;
  @Input() team: objectMini[];
  @Input() items: any;
  @Input() socialInfo: SocialInfo;
  @Input() publicInfo: PublicInfo;

  @Input() showEditBtn: boolean;

  // socialFlag: boolean;
  // publicFlag: boolean;

  trendType: string[] = [ ];
  podcastType: string[] = PodcastType;
  eventType: string[] = EventType;
  appType: string[] = ProductType;

  teamBuildFlag: boolean = false;
  streamTeam: number = 0;

  constructor(private sharedService: SharedService,
              private missionService: MissionService) {}

  // ngOnInit() {
  //   console.log('socialInfo',this.socialInfo)
  //   this.socialFlag = !Object.values(this.socialInfo).every(o => o === null);
  //   this.publicFlag = !Object.values(this.publicInfo).every(o => o === null);
  // }

  async foundersOp(mode: number, flag: boolean, event) {
    this.teamBuildFlag = flag;

    if (mode == 2) {
      this.missionService.team = event
      this.streamTeam = 3;
      await this.sharedService.updateMinis(11, null, this.missionService.id, this.missionService.id, event);
      this.streamTeam = 1;
    }
  }

}
