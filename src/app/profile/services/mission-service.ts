import { Injectable } from '@angular/core';

import {PublicInfo, SocialInfo, groupComplex} from '../../shared/services/shared-service';
import {PositionMini} from '../../shared/services/people-service';

@Injectable()
export class MissionService {
  peopleId: string;
  peopleName: string;
  peoplePic: string;
  peopleCoverPic: string;
  peoplePositions: PositionMini[];
  peopleNames: string[] = [];

  previewStatus: number = 0;

  followStatus: boolean;
  blockStatus: boolean;

  showEditBtn: boolean;
  showHeadline: boolean;
  meFlag: boolean;

  progress: boolean[];

  planStatus: string;
  planTrialEnd: Date;
  planNumber: number;

  activeTab: number = 1;

  publicInfo: PublicInfo;
  socialInfo: SocialInfo;

  followingLength: number;
  followersLength: number;
  coauthorsLength: number;
  dummyCoauthorsLength: number;
}
