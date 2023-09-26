import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {PublicInfo, SocialInfo, objectMini, objectMiniPosition, complexName, groupComplex, Period, Quote, Affiliation, ItemsViews, ItemsCounts, Plan} from './shared-service';
import {Interview, Club} from './settings-service';
import {Collaboration, Sponsor} from './collaboration-service';
import {People, PeopleNavBar} from './people-service';
import {Category, Resource} from './resource-service';
import {Topic, Project} from './project-service';
import {OpenPosition} from './position-service';
import {Rank} from './university-service';
import {FAQ} from './faq-service';
import {MarketingItem} from './admin-service';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  // Group
  async getGroupByURL(groupUrl: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/' + groupUrl, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getGroupByURL', null));
  }

  async getGroups(mode: number, id: string, userId: string, type: number = 0, mini: number = 0, term: string = ''): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getGroups?mode=' + mode + '&id=' + id + '&userId=' + userId + '&type=' + type + '&mini=' + mini, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getGroups', null));
  }

  async getGroupsFilter(mode: number, id: string, userId: string, type: number = 0, mini: number = 0, term: string = '', existIds: string[]): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getGroups?mode=' + mode + '&id=' + id + '&userId=' + userId + '&type=' + type + '&mini=' + mini, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getGroupsFilter', null));
  }

  // GroupCompare[]
  async getGroupsCompare(ids: string[]): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    if (ids[0]) {
      return this.http.get('/api/getGroupsCompare?id0=' + ids[0] + '&id1=' + ids[1] + '&id2=' + ids[2] + '&id3=' + ids[3] + '&id4=' + ids[4], { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('getGroupsCompare', []));

    } else {

      return this.http.get('/api/getGroupsCompare', { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('getGroupsCompare', []));

    }
  }

  // boolean
  async groupExist(universityId: string, departmentId: string, group: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/groupExist?universityId=' + universityId + '&departmentId=' + departmentId + '&group=' + group, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getGroupsFilter', []));
  }

  //////////////////////////////////////////
  ///////////// Group Operations ///////////
  //////////////////////////////////////////

  // PeopleNavBar
  async putCreateGroup(group: CreateGroup): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.put('/api/group.json', group, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putCreateGroup', []));
  }

  async postGroupMini(groupId: string, text: string, pic: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/group.json?id=' + groupId, {text: text, pic: pic}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postGroupMini', []));
  }

  async postGroupStage(newStage: number, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/groupStage.json?id=' + groupId, { newStage: newStage }, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postGroupStage', []));
  }

  async postGroupWelcomeStage(newWelcomeStage: number, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/groupWelcomeStage.json?id=' + groupId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postGroupWelcomeStage', []));
  }

  async toggleFollow(actorGroupId: string, targetGroupId: string, put: boolean): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    if (put == true) {

      return this.http.put('/api/groupFollow.json?actorGroupId=' + actorGroupId, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('toggleFollow', []));

    } else {

      return this.http.delete('/api/groupFollow.json?actorGroupId=' + actorGroupId + '&targetGroupId=' + targetGroupId, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('toggleFollow', []));

    }
  }

  async orderItems(objId: string, itemId: string, obj: number, mode: number, type: number, drag: number, drop: number, topicId: string = ''): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    const indexes = {drag: drag, drop: drop}

    return this.http.post('/api/itemsOrder?id=' + objId + '&itemId=' + itemId + '&obj=' + obj + '&mode=' + mode + '&type=' + type + '&topicId=' + topicId, indexes, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('orderItems', []));
  }

  //////////////////////////////////////////
  /////////////// Intelligence /////////////
  //////////////////////////////////////////

  async intelligenceNotification(id: string, itemId: string, mode: number, total: number): Promise<any> {
    // Academig Admin
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/groupIntelligenceNotification.json?id=' + id + '&itemId=' + itemId + '&mode=' + mode + '&total=' + total, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('intelligenceNotification', []));
  }

  async intelligenceDecision(id: string, itemId: string, action: number, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/groupIntelligenceDecision.json?id=' + id + '&itemId=' + itemId + '&action=' + action + '&mode=' + mode, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('intelligenceDecision', []));
  }

  //////////////////////////////////////////
  ///////////// Get Group Pages ////////////
  //////////////////////////////////////////

  // peoplesPageItems
  async getPeoplesPageByGroupId(groupId: string): Promise<any> {
    return this.http.get('/api/getPeoplesPage?id=' + groupId)
           .toPromise().catch(this.handleError('getPeoplesPageByGroupId', []));
  }

  async getPublicationsPageByGroupId(groupId: string): Promise<any> {
    return this.http.get('/api/getPublicationsPage?id=' + groupId)
           .toPromise().catch(this.handleError('getPublicationsPageByGroupId', []));
  }

  // resourcesPageItems
  async getResourcesPageByGroupId(groupId: string): Promise<any> {
    return this.http.get('/api/getResourcesPage?id=' + groupId)
           .toPromise().catch(this.handleError('getResourcesPageByGroupId', []));
  }

  // projectsPageItems
  async getProjectsPageByGroupId(groupId: string): Promise<any> {
    return this.http.get('/api/getProjectsPage?id=' + groupId)
           .toPromise().catch(this.handleError('getProjectsPageByGroupId', []));
  }

  async getCollaborationsPageByGroupId(groupId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getCollaborationsPage?id=' + groupId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getCollaborationsPageByGroupId', []));
  }

  // positionsPageItems
  async getPositionsPageByGroupId(groupId: string): Promise<any> {
    return this.http.get('/api/getPositionsPage?id=' + groupId)
           .toPromise().catch(this.handleError('getPositionsPageByGroupId', []));
  }

  async getContactsPageByGroupId(groupId: string): Promise<any> {
    return this.http.get('/api/getContactsPage?mode=2&id=' + groupId)
           .toPromise().catch(this.handleError('getContactsPageByGroupId', []));
  }

  private handleError<T> (operation = 'operation', result?: T) {
    // return (error: any): Observable<T> => {
    return (error: any): T => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      // return of(result as T);
      return (result as T);
    };
  }

  private log(message: string) { }

}

// *************** Group General ***************

export class CreateGroup {
  constructor(
    public buildMode: number,
    public buildPro: boolean,

    public members: objectMiniPosition[],

    public currentWebsite: string,
    public contactEmail: string,
    public twitter: string,

    public university: string,
    public department: string,
    public unit: string,
    public group: string,
    public logo: string,
    public quote: string,
    public statement: string,

    public country_id: number,
    public group_size: number,
    public establishDate: Date,
    public topic: string[],

    public background: string,
    public interests: string[],
    public names: string[],

    public theme: number,
    public themeIndex: number,
    public cover: string,

    public interview: Interview,
    public club: Club,

    public privacy: number,
    public allowSendEmails: boolean) {
    }
}

export class Group {
  constructor(
    public _id: string,
    public pic: string, // Project homepage.pic TO pic
    public onInvite: number, // onBehalf or Markeintg
            // 0 - Super Admin invited
            // 1 - Super Admin accepted
    public onBehalf: number,
            // 0 - Lab PI (New)
            // 1 - Lab PI (From Position)

            // 2 - Lab OnBehalf (New)
            // 3 - Lab OnBehalf (From Position)

            // 4 - Company (New)
            // 5 - Company (From Position)

            // 6 - Marketing - Lab
            // 7 - Marketing - Company

            // 8 - Job Posting - PI
            // 9 - Job Posting - OnBehalf
    public welcome: number,
    public plan: number,
    public buildPro: number,
    public domain: number,
    public marketing: MarketingItem,
    public contest: any,
    public privacy: number,
    public stage: number,
            // -1 build for me (wait button)
            // 0 initial (publish button)
            // 1 under review (withdraw button)
            // 2 published (settings button)
            // 3 on hold (unhold button)
            // 4
            // 5 from scratch
            // 6 delete
            // 7 improve (set by Academig)
            // 8 decline (set by Academig)
            // 9 on hold (set by Academig)
    public dates: Date[],
    public extScore: number,
    public intScore: number,
    public progress: number[],
    public groupIndex: groupComplex,
    public topics: Topic[],
    public piTitle: number,
    public piName: string,
    public piNames: string[],
    public membersCount: number,
    public unit: string,
    public publicInfo: PublicInfo,
    public socialInfo: SocialInfo,
    public country: number,
    public state: string,
    public city: string,
    public location: number[],
    public topic: string, // META
    public size: number, // META
    public establish: Date, // META
    public peoples: objectMini[], // META
    public interests: string[], // META
    public background: string, // META
    public projects: Project[], // SEARCH
    public resources: Resource[], // SEARCH
    public positions: OpenPosition[], // SEARCH
    // ------------------------
    public relation: Relation,
    public collaboration: Collaboration,
    public userPlan: Plan,
    public compareStatus: boolean,
    public followStatus: boolean,
    public followAdminStatus: boolean[]) {
    }
}

export class BuildGroupJob {
  constructor(
    public _id: string,
    public userStatus: number,
    public groupIndex: groupComplex,
    public firstName: string,
    public topic: string,
    public group_size: string,
    public establishDate: string) {
    }
}

export class GroupCompareMini {
  constructor(
    public _id: string,
    public pic: string,
    public groupIndex: groupComplex,
    public country: number,
    public city: string) {
    }
}

export class GroupCompare {
  constructor(
    public _id: string,
    public pic: string,
    public background: string,
    public groupIndex: groupComplex,

    public size: number,
    public establish: string,
    public intrests: string[],

    public peoples: People[],

    public publicationsTotal: number,
    public citationsTotal: number,

    public publicationsCitations: objectMini[],
    public publicationsLatest: objectMini[],
    public journals: string[],
    // public publicaitionGraph: number[],

    public positions: objectMini[],
    public projects: objectMini[],
    public resources: objectMini[],
    public fundings: objectMini[],
    public teachings: objectMini[],
    public galleries: objectMini[],
    public partners: groupComplex[],

    public expenses: objectMini[],
    public housing: objectMini[],

    public publicInfo: PublicInfo,
    public socialInfo: SocialInfo,
    public location: number[],

    // ------------------------

    public followStatus: boolean) {

    }
}

export class Relation {
  constructor(
    public status: number,
          // 0 - none,
          // 1 - waiting (NOT USED)
          // 2 - alumni
          // 3 - visitor
          // 4 - member
          // 5 - admin
          // 6 - super admin
          // 7 - on behalf
          // 8 - collaborator
    public mode: number,
          // 0 - Super Admin sent invite to User
          // 1 - User - declined invitation
          // 2 - Active User (Accepted)
          // 3 - Admin - declined request
          // 4 - User sent request to Super Admin
    public text: string,
    public period: Period,
    public email_stage: number
          // 0 - email not verified
          // 1 - email verified
    ) { }
}

// export class Project { // DELETE?
//   constructor(
//     public _id: string,
//     public title: string,
//     public pic: string) {
//     }
// }

// *************** Group Pages ***************

export class homePageItems {
  constructor(
    public background: string,
    public pic: string,
    public statement: string,
    public quote: Quote,
    public thanks: string,
    public intrests: string[],
    public topic: string[],
    public size: number,
    public establish: Date,
    public affiliations: Affiliation[],
    public views: ItemsViews,
    public counts: ItemsCounts,
    public fundings: string[],
    public journals: string[],
    public rank: Rank,
  ) {}
}

export class peoplesPageItems {
  constructor(
    public activesIds: number[],
    public visitorsIds: number[],
    public alumniIds: number[],
    public visitUs: string) {
    }
}

export class resourcesPageItems {
  constructor(
    public background: string,
    public categories: Category[]) {
    }
}

export class projectsPageItems {
  constructor(
    public background: string,
    public layManText: string,
    public layManPic: string,
    public layManCaption: string) {
    }
}

export class collaborationsPageItems {
  constructor(
    public collaborateWithUs: string) {
    }
}

export class fundingsItems {
  constructor(
    public fundingsIds: string[]) {
    }
}

export class positionsPageItems {
  constructor(
    public whyJoin: string,
    public diversity: string) {
    }
}

export class mediaItems {
  constructor(
    public talksIds: string[],
    public postersIds: string[],
    public pressesIds: string[]) {
    }
}

export class faqPageItems {
  constructor(
    public faqs: FAQ[]) {
    }
}

export class contactsPageItems {
  constructor(
    public findUs: string,
    public findUsPic: string,
    public findUsCaption: string,
    public location: number[]) {
    }
}

export let GroupSize = [
  { "id": 0, "name": "1-5", "low": 1, "high": 5 },
  { "id": 1, "name": "6-10" , "low": 6, "high": 10 },
  { "id": 2, "name": "11-20", "low": 11, "high": 20 },
  { "id": 3, "name": "21-30", "low": 21, "high": 30 },
  { "id": 4, "name": "31-40", "low": 31, "high": 40 },
  { "id": 5, "name": "41-50", "low": 41, "high": 50 },
  { "id": 6, "name": "51+", "low": 51, "high": null }
];

export let CompanySize = [
  { "id": 0, "name": "1-10", "low": 1, "high": 10 },
  { "id": 1, "name": "11-50", "low": 11, "high": 50 },
  { "id": 2, "name": "51-100", "low": 51, "high": 100 },
  { "id": 3, "name": "101-250", "low": 101, "high": 250 },
  { "id": 4, "name": "251-500", "low": 251, "high": 500 },
  { "id": 5, "name": "501-1000", "low": 501, "high": 1000 },
  { "id": 6, "name": "1001-5000", "low": 1001, "high": 5000 },
  { "id": 7, "name": "5001-10000", "low": 5001, "high": 10000 },
  { "id": 8, "name": "10001+", "low": 10001, "high": null },
];
