import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

import { Followings, PositionMini, BuildSitePosition } from '../../shared/services/people-service';
import { GroupCompareMini, BuildGroupJob } from '../../shared/services/group-service';
import { Folder } from '../../shared/services/publication-service';
import { Invite, Contest, Refinements} from '../../shared/services/shared-service';
import { Channel } from './message.service';

@Injectable()
export class UserService {

  userId: string;
  userName: string;
  userPic: string;

  userCoverPic: string;
  userProgress: boolean[];
  userWall: boolean[];
  userTour: boolean = false;
  userEmail: string;
  userEmailVerified = false; // Personal email

  userFolders: Folder[] = [];
  userChallenge: number = null;

  userContest: Contest;

  userInvites: Invite[] = null;
  userPositions: PositionMini[] = [];
  userStatus: boolean = false;

  userNewsLength: number = 0;

  isAuthenticated: boolean = null;

  userDomain: number = 0;

  planFlag: boolean = false; // user plan exist
  planQuantity: number = 0; // site quantity in user plan
  planNumber: number = 0; // user plan
  userSuperQuantity: number = 0; // number of (real) lab profiles where user is Member (x Super Admin)

  userUnseen: number = 0; // Notifications
  userUnread: number = 0; // Message
  userSearch: number = 0; // Saved Search

  newChannel: Channel;

  topFlag: boolean = false;
  errFlag: boolean = false;
  urlType: number = -2;

  buildPositionWebsiteFlag: boolean = false;
  buildMarketingWebsiteFlag: boolean = false;
  buildPersonalWebsiteFlag: boolean = false;
  buildScratchWebsiteFlag: boolean = false;

  buildPositionWebsite: BuildSitePosition;
  buildGroupJob: BuildGroupJob;

  // groupId: string = null;

  //////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

  toggleFolder(folder: string): boolean {
    const index = this.userFolders.findIndex(r => r.folder == folder)
    if (index===-1) {
      this.userFolders.push({
        "_id": null,
        "folder": folder,
        "count": 1,
        "date": null,
        "end": null,
        "summary": null,
        "privacy": null,
        "rating": null,
        "recommend": null,
        "recommended": null,
        "feed": null
      })
    }
    return true;
  }

  //////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

  userFollowings: Followings;

  toggleFollow(toFollow: boolean, itemId: string, type: string): boolean {
    if (toFollow) {
      switch (type) {
        // case "institutes": if (this.userFollowings.institutesIds.length==5) return false; else this.userFollowings.institutesIds.push(itemId); break;
        case "group": if (this.userFollowings.groupsIds.length==5) return false; else this.userFollowings.groupsIds.push(itemId); break;
        case "people": if (this.userFollowings.peoplesIds.length==5) return false; else this.userFollowings.peoplesIds.push(itemId); break;
        case "podcasts": if (this.userFollowings.podcastsIds.length==5) return false; else this.userFollowings.podcastsIds = this.userFollowings.podcastsIds || []; this.userFollowings.podcastsIds.push(itemId); break;
        case "events": if (this.userFollowings.eventsIds.length==5) return false; else this.userFollowings.eventsIds = this.userFollowings.eventsIds || []; this.userFollowings.eventsIds.push(itemId); break;
        case "apps": if (this.userFollowings.appsIds.length==5) return false; else this.userFollowings.appsIds = this.userFollowings.appsIds || []; this.userFollowings.appsIds.push(itemId); break;
        case "publication": this.userFollowings.publicationsIds.push(itemId); break;
        case "resource": this.userFollowings.resourcesIds.push(itemId); break;
        case "project": this.userFollowings.projectsIds.push(itemId); break;
        // case "job": newState = (this.positions[i].apply[0].status == 1) ? false : true; break;
      }
      return true;
    } else {
      switch (type) {
        // case "institutes": {
        //   const followIndex = this.userFollowings.groupsIds.indexOf(itemId);
        //   if (followIndex>-1) this.userFollowings.groupsIds.splice(followIndex, 1);
        //   break;
        // }
        case "group": {
          const followIndex = this.userFollowings.groupsIds.indexOf(itemId);
          if (followIndex>-1) this.userFollowings.groupsIds.splice(followIndex, 1);
          break;
        }
        case "people": {
          const followIndex = this.userFollowings.peoplesIds.indexOf(itemId);
          if (followIndex>-1) this.userFollowings.peoplesIds.splice(followIndex, 1);
          break;
        }
        case "podcasts": {
          const followIndex = this.userFollowings.podcastsIds.indexOf(itemId);
          if (followIndex>-1) this.userFollowings.podcastsIds.splice(followIndex, 1);
          break;
        }
        case "events": {
          const followIndex = this.userFollowings.eventsIds.indexOf(itemId);
          if (followIndex>-1) this.userFollowings.eventsIds.splice(followIndex, 1);
          break;
        }
        case "apps": {
          const followIndex = this.userFollowings.appsIds.indexOf(itemId);
          if (followIndex>-1) this.userFollowings.appsIds.splice(followIndex, 1);
          break;
        }
        case "publication": {
          const followIndex = this.userFollowings.publicationsIds.indexOf(itemId);
          if (followIndex>-1) this.userFollowings.publicationsIds.splice(followIndex, 1);
          break;
        }
        case "resource": {
          const followIndex = this.userFollowings.resourcesIds.indexOf(itemId);
          if (followIndex>-1) this.userFollowings.resourcesIds.splice(followIndex, 1);
          break;
        }
        case "project": {
          const followIndex = this.userFollowings.projectsIds.indexOf(itemId);
          if (followIndex>-1) this.userFollowings.projectsIds.splice(followIndex, 1);
          break;
        }
        // case "job": {
        // newState = (this.positions[i].apply[0].status == 1) ? false : true;
        // break;
        // }
      }
      return true;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

  private populateSource = new Subject<{'_id': string}>();
  populateAnnounced$ = this.populateSource.asObservable();

  announcePopulate(_id: string) {
    this.populateSource.next({'_id': _id});
  }

  //////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

  userCompareGroups: GroupCompareMini[] = [];

  private searchUnCompareSource = new Subject<{'_id': string}>();
  searchUnCompareAnnounced$ = this.searchUnCompareSource.asObservable();

  announceUnCompare(_id: string) {
    this.searchUnCompareSource.next({'_id': _id});
  }

  //////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

  searchText: string = ''
  // searchSelected: number = 0;
  searchFocus: boolean = false;

  searchRefinements: Refinements = {
    search_type: [],
    type: [],
    countries: [],
    states: [],
    cities: [],
    universities: [],
    disciplines: [],
    interests: [],
    positions: [],
    size: [],
    head: [],
    types: [],
    languages: [],
    categories: [],
    establish: null,
    times: null,
    shanghai: null,
    top: null,
    usnews: null,
    facebook: null,
    twitter: null,
    linkedin: null,
    instagram: null,
    youtube: null
  };

  private searchTextSource = new Subject<{'text': string, 'type': number}>();
  searchTextAnnounced$ = this.searchTextSource.asObservable();

  announceText(text: string, type: number) {
    // this.searchText = text;
    // this.searchSelected = type;
    this.searchTextSource.next({'text': text, 'type': type});
  }

}
