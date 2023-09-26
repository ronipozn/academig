import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {PublicInfo, SocialInfo, Invite, objectSendgrid, objectMini, objectMiniPosition, groupComplex, complexName, complexEmail, Quote, Period, Contest, Plan} from './shared-service';
import {Publication, Folder, Journal} from './publication-service';
import {FundingProfile} from './funding-service';
import {Teaching} from './teaching-service';
import {GroupCompareMini} from './group-service';
import {MarketingItem} from './admin-service';
import {Interview} from './settings-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  // ProfileBasic
  async getProfileByURL(peopleId: string, peopleUrl: string, type: number): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    if (type == 0) {

      return this.http.get('/api/getProfile/' + peopleId, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('getProfileByURL_0', null));

    } else {

      return this.http.get('/api/' + peopleUrl, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('getProfileByURL_1', null));

    }
  }

  // Profile
  async getProfileBackground(peopleId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getProfileBackground?peopleId=' + peopleId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getProfileBackground', []));
  }

  // PublicInfo
  async getPublicInfo(peopleId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getPublicInfo?id=' + peopleId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPublicInfo', []));
  }

  async getPeoples(mode: number, id: string, parentId: string, type: number = 0, mini: number = 0, more: number = 0, text: string = ''): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getPeoples?mode=' + mode + '&id=' + id + '&parentId=' + parentId + '&type=' + type + '&mini=' + mini + '&more=' + more + '&text=' + text, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPeoples', []));
  }

  // objectMini[]
  async getPeoplesFundingsRoles(mode: number, id: string, parentId: string, type: number = 0, mini: number = 0, existIds: string[]): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getPeoples?mode=' + mode + '&id=' + id + '&parentId=' + parentId + '&type=' + type + '&mini=' + mini, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPeoples', []))
           // .map(data => data.filter(r => existIds.indexOf(r._id) == -1)) // FIX
  }

  // objectMini[]
  async queryPeoples(termsList: string[]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();
    const params = new HttpParams().set('terms', termsList.join(','));

    // FIX
    return this.http.get('/api/queryPeoples', { params, headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMeetings', []));

    // return this.http.get<any>('/api/v1/queryPeoples', {
    //   params, headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
    // }).map(response => response.data);
    // const params = new HttpParams().set('_page', "1").set('_limit', "1");
  }

  private getParams(query) {
    let params: HttpParams = new HttpParams();
    for (const key of Object.keys(query)) {
      if (query[key]) {
        if (query[key] instanceof Array) {
          query[key].forEach((item) => {
            params = params.append(`${key.toString()}[]`, item);
          });
        } else {
          params = params.append(key.toString(), query[key]);
        }
      }
    }
    return params;
  }

  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////

  // PeopleNavBar
  async putPeople(people: CreatePeople): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/people.json', people, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPeople', []));
  }

  // PeopleNavBar
  async putCreateProfile(profile: CreateProfile): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/personal.json', profile, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putCreateProfile', []));
  }

  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////

  // groupComplex
  async putMember(member: CreateMember, groupId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/member.json?id=' + groupId + '&type=' + type, member, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putMember', []));
  }

  async postMember(groupId: string, type: number, mode: number, memberId: string, privilage: number, text: string, pic: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/member.json?id=' + groupId + '&type=' + type + '&mode=' + mode, {'_id': memberId, 'privilage': privilage, 'text': text, 'pic': pic}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postMember', []));
  }

  async moveMember(peopleId: string, category: number, insert: number, groupId: string, type: number, mode: number, action: number, end: Date): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/member.json?id=' + groupId + '&peopleId=' + peopleId + '&category=' + category + '&insert=' + insert + '&type=' + type + '&mode=' + mode + '&action=' + action + '&end=' + end, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('moveMember', []));
  }

  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////

  async getSearches(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/searches', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getSearches', []));
  }

  async putSearch(title: string, query: string, refinements: any): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/search.json?title=' + title + '&query=' + query, refinements, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putSearch', []));
  }

  async deleteSearch(id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/search.json?id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteSearch', []));
  }

  async exportSearch(query: string, refinements: any): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/export.json?query=' + query, refinements, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('exportSearch', []));
  }

  async getPapersKits(): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/kits', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPapersKits', []));
  }

  async getFeatured(): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/featured', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getFeatured', []));
  }

  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////

  async putPosition(createPosition: CreatePosition, peopleId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/position.json?peopleId=' + peopleId, createPosition, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPosition', []));
  }

  async postPosition(updatePosition: UpdatePosition, groupId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/position.json?id=' + groupId + '&type=' + type, updatePosition, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postPosition', []));
  }

  async deletePosition(itemId: string, peopleId: string, groupId: string, mode: number, end: Date): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/position.json?peopleId=' + peopleId + '&itemId=' + itemId + '&id=' + groupId + '&mode=' + mode + '&end=' + end, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deletePosition', []));
  }

  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////

  async getUser(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getUser', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getUser', []));
  }

  async getFollowings(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getFollowings', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getFollowings', []));
  }

  async getCalendar(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/calendar?mode=0', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getCalendar', []));
  }

  // ReportItem[]
  async getPrivateReport(peopleId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getMemberReports?peopleId=' + peopleId + '&id=' + groupId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPrivateReport', []));
  }

  async toggleFollow(mode: number, type: number, itemId: string, put: boolean): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    if (put == true) {

      return this.http.put('/api/follow.json?mode=' + mode + '&type=' + type, {'itemId': itemId}, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('toggleFollow', []));

    } else {

      return this.http.delete('/api/follow.json?mode=' + mode + '&type=' + type + '&itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('toggleFollow', []));

    }
  }

  async toggleWall(i: number, state: boolean): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/wall.json?state=' + (state ? 1 : 0) + '&index=' + i, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('toggleWall', []));
  }

  async toggleBlock(itemId: string, put: boolean): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    if (put == true) {

      return this.http.put('/api/follow.json?mode=11&type=0', {'itemId': itemId}, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('toggleBlock', []));

    } else {

      return this.http.delete('/api/follow.json?mode=11&type=0' + '&itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('toggleBlock', []));

    }

  }

  async toggleChallange(put: boolean, goal: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    if (put == true) {

      return this.http.put('/api/challenge.json?goal=' + goal, null, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('toggleChallange', []));

    } else {

      return this.http.delete('/api/challenge.json', { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('toggleChallange', []));

    }
  }

  async toggleFolder(itemId: string, folder: Folder, put: boolean, type: number = 0): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    if (put == true) {

      return this.http.put('/api/folder.json', {'itemId': itemId, 'folder': folder}, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('toggleFolder', []));

    } else {

      return this.http.delete('/api/folder.json?itemId=' + itemId + '&type=' + type + '&folder=' + folder.folder, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('toggleFolder', []));

    }
  }

  async updateReadFolder(itemId: string, folder: Folder): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/readFolder.json', {'itemId': itemId, 'folder': folder}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('updateReadFolder', []));
  }

  async removeReadFolder(itemId: string, folderId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/readFolder.json?itemId=' + itemId + '&folderId=' + folderId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('removeReadFolder', []));
  }

  async putShare(mode: number, destinationIds: string[], itemId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/share.json?mode=' + mode, {'itemId': itemId, 'ids': destinationIds}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putShare', []));
  }

  async putTable(mode: number,
           id: string,
           position: Position,
           degree: Education,
           honor: Honor,
           job: Job,
           outreach: Outreach,
           teaching: Teaching,
           service: Service,
           society: Society,
           language: Language,
           funding: FundingProfile): Promise<any> {

    let data: any;

    switch (mode) {
       case 0: data = position; break;
       case 1: data = degree; break;
       case 2: data = honor; break;
       case 3: data = job; break;
       case 4: data = outreach; break;
       case 5: data = teaching; break;
       case 6: data = service; break;
       case 7: data = society; break;
       case 8: data = language; break;
       case 9: data = funding; break;
    }

    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/profile.json?mode=' + mode + '&id=' + id, data, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putTable', []));
  }

  async postTable(mode: number,
            id: string,
            position: Position,
            degree: Education,
            honor: Honor,
            job: Job,
            outreach: Outreach,
            teaching: Teaching,
            service: Service,
            society: Society,
            language: Language,
            funding: FundingProfile): Promise<any> {

    let data: any;

    switch (mode) {
       case 0: data = position; break;
       case 1: data = degree; break;
       case 2: data = honor; break;
       case 3: data = job; break;
       case 4: data = outreach; break;
       case 5: data = teaching; break;
       case 6: data = service; break;
       case 7: data = society; break;
       case 8: data = language; break;
       case 9: data = funding; break;
    }

    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/profile.json?mode=' + mode + '&id=' + id, data, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postTable', []));
  }

  async deleteTable(mode: number, itemId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/profile.json?mode=' + mode + '&itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTable', []));
  }

  // PeopleNavBar
  async postPeopleStage(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/peopleStage.json', null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postPeopleStage', []));
  }

  async putPeopleSkip(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/skip.json', null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPeopleSkip', []));
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

  private log(message: string) {
    // this.messageService.add(`HeroService: ${message}`);
  }

}

export let titleSelect = [
  {display: 'Full Professor', value: 100},
  {display: 'Associate Professor', value: 101},
  {display: 'Assistant Professor', value: 102},
  {display: 'Professor Emeritus', value: 103},

  {display: 'Director', value: 150},

  {display: 'Technician', value: 152},
  {display: 'Assistant', value: 153},
  {display: 'Secretary', value: 154},

  {display: 'Senior Staff', value: 155},
  {display: 'Lab Manager', value: 156},
  {display: 'Research Assistant Professor', value: 157},

  {display: 'Assistant Researcher', value: 160},

  {display: 'Postdoc', value: 201},

  {display: 'Ph.D.', value: 301},
  {display: 'M.Sc.', value: 300},

  {display: 'B.A.Sc.', value: 400},
  {display: 'B.Sc.', value: 401},
  {display: 'B.A.', value: 402}
 ];

export let openPositionSelect = [
 {display: 'Director', value: 150},
 // {display: 'Research Chair', value: 151},
 {display: 'Technician', value: 152},
 {display: 'Assistant', value: 153},
 {display: 'Secretary', value: 154},

 {display: 'Senior Staff', value: 155},
 {display: 'Lab Manager', value: 156},
 {display: 'Research Assistant Professor', value: 157},

 {display: 'Assistant Researcher', value: 160},

 // {display: 'Post-Doctoral Research Associate', value: 200},
 // {display: 'Post-Doctoral Fellow', value: 201},
 {display: 'Postdoc', value: 201},

 // {display: 'Ph.D. Student', value: 303},
 {display: 'Ph.D.', value: 301},
 {display: 'M.Sc.', value: 300},

 {display: 'B.A.Sc.', value: 400},
 {display: 'B.Sc.', value: 401},
 {display: 'B.A.', value: 402}

 // Intern
 // Senior Researcher
 // Lecturer
 // Adjunct Professor
 // PhD Student
 // Postdoctoral Researcher/Fellow/Scholar
 // Visiting Assistant Professor (VAP)
 // Lecturer/Instructor
 // Research Assistant
 // Research Associate/Scientist/Fellow
 // Laboratory Assistant
 // Laboratory Manager
 // Master's Student
 // PostDoc Position
 // PhD Student
 // PhD
 // Senior Researcher
 // Professional Doctorate in Engineering (PDEng)
 // Medical Doctor
 // Other
];

export let titlesTypes = {
  100: 'Full Professor',
  101: 'Associate Professor',
  102: 'Assistant Professor',
  103: 'Professor Emeritus',

  150: 'Director',

  152: 'Technician',
  153: 'Assistant',
  154: 'Secretary',

  155: 'Senior Staff',
  156: 'Lab Manager',
  157: 'Research Assistant Professor',

  160: 'Assistant Researcher',

  201: 'Postdoc',

  300: 'M.Sc.',
  301: 'Ph.D.',
  303: 'Ph.D.', // Delete...

  400: 'B.A.Sc.',
  401: 'B.Sc.',
  402: 'B.A.'
};

// STATUS:
// 0 - none // NOT USED
// 1 - waiting // NOT USED
// 2 - alumni
// 3 - visitor
// 4 - member
// 5 - admin
// 6 - super admin
// 7 - on behalf
// 8 - dummy alumni
// 9 - dummy member
// 10 - marketer

// MODE:
// 0 - Super Admin - send invite to User
// 1 - User - declined invitation
// 2 - Active User (Accepted)
// 3 - Admin - declined request
// 4 - User send request to Super Admin

export class CreatePeople {
  constructor(
    public oauth_id: string,
    public name: string,
    public email: string,
    public email_verified: number,
    public pic: string,
    ) {
    }
}

export class CreateMember {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public email: string,
    public mode: number,
    public status: number,
    public titles: number[],
    public text: string,
    public period: Period,
    public group: groupComplex,
    public groupId: string,
    public degree: Degree,
    public ai: boolean
    ) {
    }
}

export class UpdateMember {
  constructor(
    public _id: string,
    public privilage: number,
    public text: string
    ) {
    }
}

export class CreateProfile {
  constructor(
    public firstName: string,
    public lastName: string,
    public country_id: number,
    public pic: string,

    public background: string,
    public interests: string[],

    public position: number,
    public period: Period,
    public university: string,
    public department: string,
    public group: string,

    public challengeGoal: number,

    public papersKitStatus: number,

    public names: string[],

    public theme: number,
    public themeIndex: number,
    public cover: string,

    public groupsIds: string[],

    public buildMode: number,
    public buildPro: number,
    public mentorStatus: number,
    public interview: Interview,
    public members: objectMiniPosition[],
    public currentWebsite: string,
    public group_size: number,
    public establishDate: Date,
    public topic: string[]) {
    }
}

//////////////////////////////
//////////////////////////////
//////////////////////////////
//////////////////////////////

export class BuildSitePosition {
  constructor(
    public group: groupComplex,
    public period: Period,
    public titles: number[],
  ) {}
}

export class CreatePosition {
  constructor(
    public status: number,
    public mode: number,
    public period: Period,
    public titles: number[],
    public groupId: string,
    public text: string,
    public degree: Degree
  ) {}
}

export class UpdatePosition {
  constructor(
    public _id: string,
    public positionId: string,
    public titles: number[],
    public index: number,
    public oldCategory: number,
    public newCategory: number,
    public period: Period,
    public degree: Degree) {
    }
}

export class PositionMini {
  constructor(
    public coverPic: string,
    public status: number,
    public mode: number,
    public titles: number[],
    public period: Period,
    public email: complexEmail,
    public group: groupComplex,
    public contest: Contest) {
    }
}

export class Position {
  constructor(
    public _id: string,
    public status: number,
           // 2 - alumni
           // 3 - visitor
           // 4 - member
           // 5 - admin
           // 6 - super admin
           // 7 - on behalf
           // 8 - dummy member
           // 9 - dummy alumni
    public mode: number,
           // 0 - Super Admin send invite to User
           // 1 - User - declined invitation
           // 2 - Active User (Accepted)
           // 3 - Admin - declined request
           // 4 - User send request to Super Admin
    public period: Period,
    public titles: number[],
    public stage: number, // group stage
    public group: groupComplex,
    public text: string,
  ) {}
}

export class Education extends Position {
  constructor(
    public _id: string,
    public status: number,
    public mode: number,
    public period: Period,
    public titles: number[],
    public stage: number, // group stage
    public group: groupComplex,
    public text: string,
    public degree: Degree
  ) {
    super(_id, status, mode, period, titles, stage, group, text);
  }
}

export class Degree {
  constructor(
    public field: string,
    public thesis: string,
    public grade: number,
    public honor: string,
    public file: string) {
    }
}

export class Job {
  constructor(
    public _id: string,
    public period: Period,
    public name: string,
    public title: string,
    public description: string) {
    }
}

export class Honor {
  constructor(
    public _id: string,
    public period: Period,
    public name: string) {
    }
}

export class Outreach {
  constructor(
    public _id: string,
    public period: Period,
    public name: string,
    public role: string) {
    }
}

export class Service {
  constructor(
    public _id: string,
    public period: Period,
    public journal: Journal,
    public role: number) {
    }
}

export class Society {
  constructor(
    public _id: string,
    public name: string) {
    }
}

export class Language {
  constructor(
    public _id: string,
    public name: string,
    public level: number) {
    }
}

export class People {
  constructor(
    public _id: string,
    public name: string,
    public stage: number,
    public pic: string,
    public progress: boolean[],
    public email: string,
    public positions: Education[],
    public followStatus: boolean,

    public views: number,
    public followedSize: number,
    public publicationsSize: number,
    public currentSize: number,

    public quote: Quote,
    public currentReading: Publication
    ) {
    }
}

export class PeopleNavBar {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public coverPic: string,
    public stage: number,
    public progress: boolean[],
    public wall: boolean[],
    public quantity: number,
    public domain: number,
    public plan: number,
    public unseen: number,
    public unread: number,
    public search: number,
    public positions: PositionMini[],
    public compare: GroupCompareMini[] = [],
    public followings: Followings,
    public invites: Invite[],
    public folders: Folder[],
    public challenge: number,
    public contest: any,
    public token: string,
    // public status: number[],
    ) {
    }
}

export class PeopleSendgrid extends People {
  constructor(
    public _id: string,
    public name: string,
    public stage: number,
    public pic: string,
    public progress: boolean[],
    public email: string,
    public positions: Education[],
    public followStatus: boolean,
    public views: number,
    public followedSize: number,
    public publicationsSize: number,
    public currentSize: number,
    public quote: Quote,
    public currentReading: Publication,
    public emails: objectSendgrid
  ) {
    super(_id, name, stage, pic, progress, email, positions, followStatus, views, followedSize, publicationsSize, currentSize, quote, currentReading);
  }
}

export class Followings {
  constructor(
    public institutesIds: string[],
    public departmentsIds: string[],
    public groupsIds: string[],
    public companiesIds: string[],
    public resourcesIds: string[],
    public projectsIds: string[],
    public peoplesIds: string[],
    public podcastsIds: string[],
    public eventsIds: string[],
    public appsIds: string[],

    public positionsIds: string[],
    public publicationsIds: string[],
    ) {
    }
}

export class ProfileBasic {
  constructor(
    public _id: string,
    public flag: boolean,
    public name: string,
    public names: string[],
    public pic: string,
    public coverPic: string,
    public plan: number,
    public domain: number,
    public email: string,
    public marketing: MarketingItem,
    public stage: number,
    public followStatus: boolean,
    public blockStatus: boolean,
    public positions: PositionMini[],
    public userPlan: Plan,
    public publicInfo: PublicInfo,
    public socialInfo: SocialInfo,
    public progress: boolean[],
    public interests: string[], // META
    public background: string // META
    ) {
    }
}

export class Profile {
  constructor(
    // public completenessPercent: number,
    // public completenessSuggest: string,
    // public highlights: any[],
    public _id: string,
    public name: string,
    public pic: string,

    public views: any,
    public counts: any,
    public folders: Folder[],
    public progress: boolean[],

    public quote: Quote,
    public coverPic: string,
    public followStatus: boolean,
    public blockStatus: boolean,
    public background: string,
    public meetClip: string,
    public researchInterests: string[],

    public positions: Array<Education>, // Degree is extension of Position
    public jobs: Array<Job>, // Degree is extension of Position
    public honors: Array<Honor>,
    public outreach: Array<Outreach>,
    public services: Array<Service>,
    public societies: Array<Society>,
    public languages: Array<Language>,
    public recreationalInterests: string[]) {
    }
}

export class ReportItem {
  constructor(
    public _id: string,
    public groupId: string,
    public date: Date,
    public title: string,
    public file: string,
    public submitStatus: number) {
    }
}

@Injectable()
export class ProfileSortService {

  arraySort(array): void {

    const asc = 1;

    const x1 = asc ? 1 : -1
    const x2 = asc ? -1 : 1

    array.sort((a: Honor, b: Honor) => {
      if (a.period.start < b.period.start) {
        return x1;
      } else if (a.period.start  > b.period.start) {
        return x2;
      } else {
        return 0;
      }
    });
  }

}
