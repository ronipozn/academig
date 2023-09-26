import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, complexName, groupComplex} from './shared-service';
import {ReportItem} from './people-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SeminarService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getMeetings(groupId: string, type: number = 0): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }
    
    return this.http.get('/api/getPrivateMeetings?id=' + groupId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMeetings', []));
  }

  async putMeetings(settings: settingsMeetings, meetings: privateMeeting[], groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/privateMeetings.json?id=' + groupId, {'settings': settings, 'meetings': meetings}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putMeetings', []));
  }

  async deleteMeetings(meetingId: number, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/privateMeetings.json?id=' + groupId + '&meetingId=' + meetingId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteMeetings', []));
  }

  async putSingleMeeting(meeting: privateMeeting, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/privateSingleMeeting.json?id=' + groupId, {'meeting': meeting}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putSingleMeeting', []));
  }

  async postSingleMeeting(meetingId: number, groupId: string, type: number): Promise<any> {
    // Type:
    // 0 - Cancel
    // 1 - Resume

    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/privateSingleMeeting.json?id=' + groupId + '&meetingId=' + meetingId + '&type=' + type, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postSingleMeeting', []));
  }

  async deleteSingleMeeting(meetingId: number, groupId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/privateSingleMeeting.json?id=' + groupId + '&meetingId=' + meetingId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteSingleMeeting', []));
  }

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

}

export class futureMeetingsItems {
  constructor(
    public settings: settingsMeetings,
    public meetings: privateMeeting[]
  ) {}
}

export class pastMeetingsItems {
  constructor(
    public settings: settingsMeetings,
    public meetings: privateMeeting[]
  ) {}
}

export class settingsMeetings {
  constructor(
    public location: string,
    public time: string,
    public startDate: Date,
    public endDate: Date,
    // public duration: number,
    public howOften: number,
    public howToAdd: number,
    public day: number,
    public secondDay: number,
    public order: number,
    public participants: objectMini[]) {
    }
}

export class privateMeeting {
  constructor(
    public _id: number,
    public date: Date,
    public location: string,
    public presenter: objectMini,
    public topic: string,
    public files: string,
    public activeFlag: boolean
  ) {}
}
