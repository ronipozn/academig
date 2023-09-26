import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, objectMiniEmail, complexName, groupComplex} from './shared-service';
import {CreatePublication, Journal} from './publication-service';
import {Interview} from './settings-service';
// import {PeopleSendgrid} from './people-service';
import {Report} from './settings-service';

import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  //////////////////////////////////////////
  ////////////// Universities //////////////
  //////////////////////////////////////////

  async getUniversities(text: string, id: number, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/adminUniversities?mode=' + mode + '&text=' + text + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getUniversities', []));
  }

  async getUniversitiesQuery(text: string, id: number, flag: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/adminUniversities?text=' + text + '&id=' + id + '&flag=' + flag + '&mode=1', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('adminUniversities', []));
  }

  async putUniversityQuery(university: CreateUniversity): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/university.json', university, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putUniversityQuery', []));
  }

  async deleteUniversityQuery(id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/universityQuery.json?id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteUniversityQuery', []));
  }

  //////////////////////////////////////////
  ///////////////// Groups /////////////////
  //////////////////////////////////////////

  async getGroups(mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/groupsAdmin?mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getGroups', []));
  }

  async getGroupsIncomplete(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/groupsAdminIncomplete', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getGroupsIncomplete', []));
  }

  async postGroupStage(groupId: string, adminApprove: AdminApprove): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/groupStageAdmin.json?groupId=' + groupId, adminApprove, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postGroupStage', []));
  }

  async postGroupInstitute(groupId: string, adminApprove: AdminApprove): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/groupInstituteAdmin.json?groupId=' + groupId, adminApprove, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postGroupStage', []));
  }

  async postGroupStripe(groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/stripe.json?id=' + groupId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postGroupStage', []));
  }

  async postMarketing(groupId: string, msg: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/itemMarketing.json?id=' + groupId + '&mode=' + mode, {"msg": msg}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postMarketing', []));
  }

  async getEmailsStats(id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/emailsStats?id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getEmailsStats', []));
  }

  //////////////////////////////////////////
  /////////////////// Loop /////////////////
  //////////////////////////////////////////

  async getContests(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/contests', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getContests', []));
  }

  async postContest(config: any): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/contest.json', {"config": config}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postContest', []));
  }

  async actionContest(contestId: string, status: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/contestAction.json?id=' + contestId + '&status=' + status, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('actionContest', []));
  }

  //////////////////////////////////////////
  ///////////////// People /////////////////
  //////////////////////////////////////////

  async getPeoples(more: number,
                   verifiedFlag: boolean,
                   challengesFlag: boolean,
                   librariesFlag: boolean,
                   domainsFlag: boolean,
                   followingsFlag: boolean,
                   updatesFlag: boolean,
                   suggestionsFlag: boolean,
                  ): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/peoplesAdmin?more=' + more +
                         '&flag=' + (verifiedFlag ? 1 : 0) +
                         '&challenges=' + (challengesFlag ? 1 : 0) +
                         '&libraries=' + (librariesFlag ? 1 : 0) +
                         '&domains=' + (domainsFlag ? 1 : 0) +
                         '&followings=' + (followingsFlag ? 1 : 0) +
                         '&updates=' + (updatesFlag ? 1 : 0) +
                         '&suggestions=' + (suggestionsFlag ? 1 : 0)
                         , { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPeoples', []));
  }

  async newsUpdatesById(peopleId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/newsUpdates?id=' + peopleId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPeoples', []));
  }

  async postProgress(): Promise<any> {
    // LABS?
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/progress.json', null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postProgress', []));
  }

  async postProgressById(peopleId: string): Promise<any> {
    // RESEARCGERS?
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/progressById.json?id=' + peopleId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postProgressById', []));
  }

  //////////////////////////////////////////
  ////////////// Publications //////////////
  //////////////////////////////////////////

  async getSchedules(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/schedulesAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getSchedules', []));
  }

  async getPublications(queryDate: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/publicationsMarketing?date=' + queryDate + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPublications', []));
  }

  async putPublicationMarketing(createPublication: CreatePublication): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/publicaitionMarketing.json', createPublication, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPublicationMarketing', []));
  }

  async publicaitionMarketingAll(queryDate: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/publicaitionMarketingAll.json?date=' + queryDate, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('publicaitionMarketingAll', []));
  }

  async deletePublicationMarketing(itemId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/publicaitionMarketing.json?id=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deletePublicationMarketing', []));
  }

  //////////////////////////////////////////
  /////////////////// Jobs /////////////////
  //////////////////////////////////////////

  async getPositions(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/positionsAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPositions', []));
  }

  async getPositionDetails(positionId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/positionAdmin/' + positionId + '.json', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPositionDetails', null));
  }

  async putPositionStat(positionId: string, stats: number[][]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/positionStats/' + positionId + '.json', { "stats": stats }, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPositionStat', []));
  }

  async postPositionStat(positionId: string, index: number[], stat: number[]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/positionStats/' + positionId + '.json', {"index": index, "stat": stat}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postPositionStat', []));
  }

  async postCandidateFilterStatus(positionId: string, peopleId: string, status: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/positionFilterStatus/' + positionId + '.json?peopleId=' + peopleId, {"status": status}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postCandidateFilterStatus', []));
  }

  async postCandidateFilterNote(positionId: string, peopleId: string, note: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/positionFilterNote/' + positionId + '.json?peopleId=' + peopleId, {"note": note}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postCandidateFilterNote', []));
  }

  async postPositionFilter(positionId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/positionFilter/' + positionId + '.json?mode=' + mode, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postPositionFilter', []));
  }

  //////////////////////////////////////////
  ///////////////// Reports ////////////////
  //////////////////////////////////////////

  async getReports(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/reportsAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getReports', []));
  }

  //////////////////////////////////////////
  ////////////////// Data //////////////////
  //////////////////////////////////////////

  async getDataRequests(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/dataAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getDataRequests', []));
  }

  //////////////////////////////////////////
  ///////////////// Mentors ////////////////
  //////////////////////////////////////////

  async getMentors(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/mentorsAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMentors', []));
  }

  //////////////////////////////////////////
  ////////////////// Items /////////////////
  //////////////////////////////////////////

  async getDeals(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/dealsAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getDeals', []));
  }

  async getTrendsSubmit(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/trendsAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getTrendsSubmit', []));
  }

  async getPodcastsSubmit(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/podcastsAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPodcastsSubmit', []));
  }

  async getEventsSubmit(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/eventsAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getEventsSubmit', []));
  }

  async getAppsSubmit(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/appsAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getAppsSubmit', []));
  }

  //////////////////////////////////////////
  //////////////// Contacts ////////////////
  //////////////////////////////////////////

  async getContactsMessages(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/contactsAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getContactsMessages', []));
  }

  //////////////////////////////////////////
  ///////////////// Claims /////////////////
  //////////////////////////////////////////

  async getItemsClaims(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/claimsAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getItemsClaims', []));
  }

  //////////////////////////////////////////
  ///////////////// Logging ////////////////
  //////////////////////////////////////////

  async getItemsLoggings(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/loggingAdmin', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getItemsLogging', []));
  }

  //////////////////////////////////////////
  ///////////////// Aloglia ////////////////
  //////////////////////////////////////////

  async postAlgolia(i: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/algolia.json?type=' + i, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postAlgolia', []));
  }

  //////////////////////////////////////////
  /////////////// Newsletter ///////////////
  //////////////////////////////////////////

  async putDaily(submitDaily): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/daily.json', submitDaily, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putDaily', []));
  }

  async putStory(submitStory): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/story.json', submitStory, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putStory', []));
  }

  // queryWikipedia(term: string, options, callback) {
  //     // options.params is an HttpParams object
  //     const params = 'action=opensearch&search=tel_aviv_university&limit=1&namespace=0&format=jsonfm'
  //     console.log('params',params)
  //     return this.http.jsonp(`${`https://en.wikipedia.org/w/api.php`}?${params}`, callback)
  //       .map((response: Response) => response[1])
  //       .map((results: any[]) => results.map((result: string) => result[0]));
  //  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) { }

  // public securedPing(): void {
  //   this.message = '';
  //   this.http.get(`${this.API_URL}/private`, {
  //     headers: new HttpHeaders()
  //       .set('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
  //   })
  //     .subscribe(
  //       data => this.message = (data as IApiResponse).message,
  //       error => this.message = error
  //     );
  // }
  // .post<IApiResponse>(`${this.API_URL}/admin`, {}, {
  //   headers: new HttpHeaders()
  //     .set('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
  // })

}

export class AdminApprove {
 constructor(
   public currentStage: number,
   public newStage: number,
   public text: string,
   public department: complexName,
   public university: complexName,
   // public departmentWebsite: string,
   // public universityWebsite: string,
   // public departmentDescription: string,
   // public universityDescription: string
 ) {
   }
}

export class GroupApprove {
  constructor(
    public _id: string,
    public onBehalf: number,
    public buildPro: number,
    public currentWebsite: string,
    public stage: number,
    public interview: Interview,
    public papersKit: Interview,
    public marketing: MarketingItem,
    public domain: number,
    public dates: Date[],
    public extScore: number,
    public intScore: number,
    public progress: boolean[],
    public groupIndex: groupComplex) {
    }
    // additional:
    // groups count
    // "level of activity" - how many new ites, types of items
    // Percentage of Groups registered (compared to department website)
}

export class PeopleAdmin {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public date: Date,
    public stage: number,
    public email: string,
    public challenge: any, // TBD
    public subscribe: boolean[],
    public progress: boolean[],
    public progressNotify: boolean[],
    public positions: Position[]) {
    }
}

export class PublicationMarketing {
  constructor(
    public adminId: string,
    public dates: Date[],
    public _id: string,
    public title: string,
    public doi: string,
    public date: Date,
    public abstractPic: string,
    public journal: Journal,
    public authors: objectMiniEmail[]) {
    }
}

export class Library {
  constructor(
    public user: objectMini,
    public challenge: any,
    public library: any) {
    }
}

export class ContactMessages {
  constructor(
    public _id: string,
    public messages: {
      "toId": string,
      "mode": number,
      "date": Date
      }
    ) {
    }
}

export class Logging {
  constructor(
    public _id: string,
    public userId: string,
    public date: Date,
    public itemId: string,
    public type: number,
    public message: string
    ) {
    }
}

export class ItemClaim {
  constructor(
    public item: objectMini,
    public user: objectMini,
    public dates: Date
    ) {
    }
}

export class DepartmentAdmin {
  constructor(
    public _id: string,
    public stage: number,
    public date: Date,
    public name: string,
    public link: string,
    public pic: string) {
    // groups count
    // "level of activity" - how many new ites, types of items
    // Percentage of Groups registered (compared to department website)
    }
}

export class UniversityAdmin {
  constructor(
    public _id: string,
    public stage: number,
    public dates: Date,
    public name: string,
    public link: string,
    public pic: string,
    public categories: number,
    public departments: number) {
    // level of activity
    // Percentage of Departments created
    }
}

export class UniversityQuery {
  constructor(
    public _id: string,
    public name: string,
    public url: string,
    public country_id: number,
    public academigId: string) {
    }
}

export class CreateUniversity {
  constructor(
    public _id: string,
    public name: string,
    public link: string,
    public url: string,
    public pic: string,
    public description: string,
    public source: string,
    public country_id: number,
    public state: string,
    public city: string) {
    }
}

export class DomainRequest {
  constructor(
    public user: objectMini,
    public dates: Date[]) {
    }
}4

export class MarketingItem {
  constructor(
    public counter: number,
    public url: string,
    public text: string,
    public pics: string[],
    public dates: Date[],
    public user: string[]) {
    }
}
