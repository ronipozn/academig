import {Injectable} from '@angular/core';

import {PublicInfo, SocialInfo, objectMini} from '../../shared/services/shared-service';

@Injectable()
export class MissionService {
  userId: string;
  showEditBtn = true;

  // universityStatus: number;

  universityId: string;
  universityLink: string;

  universityPic: string;
  universityName: string;

  universityCounters: number[];
  universityPics: objectMini[];

  universityCountry: number;
  universityState: string;
  universityCity: string;
  universityLocation: number[];

  universityExternalLink: string;
  universityDescription: string;
  universitySource: string;

  publicInfo: PublicInfo;
  socialInfo: SocialInfo;

  searchFlag: boolean = false;
  searchText: string;
  searchType: number = 2;
}
