import { Injectable } from '@angular/core';

import {PublicInfo, SocialInfo, objectMini, groupComplex} from '../../shared/services/shared-service';
import {Topic} from '../../shared/services/project-service';

@Injectable()
export class MissionService {
  userStatus: number;
  userStatusMode: number;
  previewStatus = 0;

  instituteEmailVerified: number;
  followStatus: boolean;
  showPage: boolean;
  showEditBtn: boolean;
  showHeadline: boolean;
  errorFlag: boolean = false;

  onInvite: number;
  onBehalf: number;

  groupType: boolean;
  groupTypeTitle: string;

  userId: string;
  groupId: string;
  groupTitle: string;
  groupName: string;

  topics: Topic[];

  piTitle: number;
  piName: string;
  piNames: string[] = [];

  groupCoverPic: string;
  groupIndex: groupComplex;
  groupStage: number;
  extScore: number;
  intScore: number;
  groupProgress: number[];

  location: number[];
  country: number;
  state: string;
  city: string;

  planStatus: string;
  planTrialEnd: Date;
  planNumber: number;

  buildPro: number;

  breadDetailsName: string;
  breadDetailsStream: number;

  activeTab: number = 1;

  publicInfo: PublicInfo;
  socialInfo: SocialInfo;

  isAuthenticated: boolean = false;
}
