import {Injectable} from '@angular/core';

import {objectMini, PublicInfo, SocialInfo} from '../../shared/services/shared-service';

@Injectable()
export class MissionService {
  userId: string;
  showEditBtn: boolean;
  
  followStatus: boolean;

  type: number;
  stage: number;

  id: string;
  name: string;
  link: string;
  pic: string;

  country: number;
  state: string;
  city: string;
  location: number[];

  team: objectMini[];

  publicInfo: PublicInfo;
  socialInfo: SocialInfo;

  isAuthenticated: boolean = false;
}
