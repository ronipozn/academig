import {Injectable} from '@angular/core';

import {departmentComplex} from '../../shared/services/department-service';

import {PublicInfo, SocialInfo, objectMini} from '../../shared/services/shared-service';

@Injectable()
export class MissionService {
  userId: string;
  showEditBtn: boolean = true;

  departmentId: string;
  departmentType: number;
  departmentStage: number;
  departmentIndex: departmentComplex;
  departmentPic: string;
  departmentTitle: string;

  departmentCounters: number[];
  departmentPics: objectMini[];

  departmentCountry: number;
  departmentState: string;
  departmentCity: string;
  departmentLocation: number[];

  departmentExternalLink: string;
  departmentDescription: string;
  departmentSource: string;

  publicInfo: PublicInfo;
  socialInfo: SocialInfo;

  searchFlag: boolean = false;
  searchText: string;
  searchType: number = 2;

  isAuthenticated: boolean = false;
}
