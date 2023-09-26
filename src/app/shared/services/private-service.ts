import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, complexName, groupComplex} from './shared-service';
import {ReportItem} from './people-service';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

@Injectable({
  providedIn: 'root'
})
export class PrivateService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  // ************** ************** **************
  // ************** ************** **************
  // **************** Group News ****************
  // ************** ************** **************
  // ************** ************** **************

  // privateNews[]
  async getPrivateNews(groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getPrivateNews?id=' + groupId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPrivateNews', []));
  }

  // privateNews[]
  async getPrivateComments(newsId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getPrivateComments?id=' + groupId + '&itemId=' + newsId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPrivateNews', []));
  }

  async putNews(news: CreateNews, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/privateNews.json?id=' + groupId, news, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putNews', []));
  }

  async postNews(news: UpdateNews, itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/privateNews.json?id=' + groupId + '&itemId=' + itemId, news, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postNews', []));
  }

  async deleteNews(itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/privateNews.json?id=' + groupId + '&itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteNews', []));
  }

  async putComment(news: CreateNews, itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/privateComment.json?id=' + groupId + '&itemId=' + itemId, news, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putComment', []));
  }

  async postComment(news: UpdateNews, commentId: string, itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/privateComment.json?id=' + groupId + '&itemId=' + itemId + '&commentId=' + commentId, news, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postComment', []));
  }

  async deleteComment(commentId: string, itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/privateComment.json?id=' + groupId + '&itemId=' + itemId + '&commentId=' + commentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postComment', []));
  }

  // ************** ************** **************
  // ************** ************** **************
  // *************** Group Calendar *************
  // ************** ************** **************
  // ************** ************** **************

  // privateCalendarItems
  async getCalendar(groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/calendar?mode=1' + '&id=' + groupId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getCalendar', []));
  }

  // ************** ************** **************
  // ************** ************** **************
  // *************** Group Reports **************
  // ************** ************** **************
  // ************** ************** **************

  // privateReportsItems
  async getPrivateReports(groupId: string, type: number = 0): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getPrivateReports?id=' + groupId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPrivateReports', []));
  }

  async putPrivateReports(settings: settingsReports, submissionDate: Date, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/privateReports.json?id=' + groupId, {'settings': settings, 'date': submissionDate}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPrivateReports', []));
  }

  async postPrivateReports(settings: settingsReports, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/privateReports.json?id=' + groupId, {'settings': settings}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postPrivateReports', []));
  }

  async deletePrivateReports(groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/privateReports.json?id=' + groupId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deletePrivateReports', []));
  }

  async postSinglePrivateReport(report: currentReport, groupId: string, type: number): Promise<any> {
    // Type:
    // 0 - Update current report details
    // 1 - Cancel upcoming report
    // 2 - Finalize report
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/privateSingleReport.json?id=' + groupId + '&type=' + type, {'report': report}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postSinglePrivateReport', []));
  }

  async putPrivateReportSubmit(groupId: string, title: string, current: string, next: string, delay: string, file: string): Promise<any> {
    // Submit
    // ReSubmit
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/privateSingleReport.json?id=' + groupId, {'title': title, 'current': current, 'next': next, 'delay': delay, 'file': file}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPrivateReportSubmit', []));
  }

  async deletePrivateReportSubmit(groupId: string, type: number): Promise<any> {
    // Type:
    // 0 - Skip
    // 1 - Delete
    // 2 - Resume
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/privateSingleReport.json?id=' + groupId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deletePrivateReportSubmit', []));
  }

  async putPrivatReportRemind(ids: string[], groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/privateReportRemind.json?id=' + groupId, ids, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPrivatReportRemind', []));
  }

  async putPrivateReportFinalize(peopleReports: ReportItem[], groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/privateReportFinazlie.json?id=' + groupId, peopleReports, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPrivateReportFinalize', []));
  }

  async deletePrivatePastReport(itemId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/privateReport.json?itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deletePrivatePastReport', []));
  }

  // ************** ************** **************
  // ************** ************** **************
  // *************** Group Events ***************
  // ************** ************** **************
  // ************** ************** **************

  // getPrivateEvents(groupId: string): Observable<privateEvent[]> {
  //   return this.http.get<any>('/api/v1/getPrivateEvents?id=' + groupId, {
  //     headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
  //   }).map(response => response.data);
  // }
  //
  // putEvent(event: privateEvent, groupId: string): Observable<string> {
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   return this.http.put<any>('/api/v1/privateEvent.json?id=' + groupId, event, {
  //     headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
  //   }).map(response => response.data);
  // }
  //
  // postEvent(event: privateEvent, groupId: string): Observable<string> {
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   return this.http.post<any>('/api/v1/privateEvent.json?id=' + groupId, event, {
  //     headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
  //   }).map(response => response.data);
  // }
  //
  // deleteEvent(itemId: string, groupId: string): Observable<string> {
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   return this.http.delete<any>('/api/v1/privateEvent.json?id=' + groupId + '&itemId=' + itemId, {
  //     headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
  //   }).map(response => response.data);
  // }

  // ************** ************** **************
  // ************** ************** **************
  // *************  Perosnal Info ***************
  // ************** ************** **************
  // ************** ************** **************

  // PersonalInfo
  async getPersonalInfo(peopleId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getPersonalInfo?peopleId=' + peopleId + '&id=' + groupId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPersonalInfo', []));
  }

  async postPersonalInfo(personalInfo: PersonalInfo): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/personalInfo.json', personalInfo, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPersonalInfo', []));
  }

  // ************** ************** **************
  // ************** ************** **************
  // *************  Group Analytics *************
  // ************** ************** **************
  // ************** ************** **************

  // getOverallAnalyticById(groupId: string): Observable<privateAnalyticsItems> {
  //   return this.http.get<any>('/api/v1/getOverallAnalytics?id='+groupId)
  //     .map(response => response.data);
  // }

  // getAnalyticById(groupId: string, type: number): Observable<any[]> {
  //   return this.http.get<any>('/api/v1/getAnalytics?id='+groupId+'&type='+type)
  //     .map(response => response.data);
  // }

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

// *************** Group Private ***************

export class privateNews {
  constructor(
    public _id: string,
    public actor: objectMini,
    public verb: number,
    public object: objectMini,
    public time: Date,
    public text: string,
    public pic: string,
    public numComments: number,
    public comments: privateNews[]
  ) {
  }
}

export class CreateNews {
  constructor(
    public actorId: string,
    public verb: number,
    public objectId: string,
    public text: string,
    public pic: string) {
  }
}

export class UpdateNews {
  constructor(
    public verb: number,
    public objectId: string,
    public text: string,
    public pic: string) {
  }
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

// export class privateCalendarItems {
//   constructor(
//     public meetings: privateMeeting[]
//   ) {}
// }

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

export class privateReportsItems {
  constructor(
    public settings: settingsReports,
    public currentReport: currentReport) {
    }
}

export class settingsReports {
  constructor(
    public howOften: number,
    public duration: number,
    public day: number,
    public time: string,
    public whoSee: objectMini[],
    public whoSubmit: peopleReport[]) {
    }
}

export class currentReport {
  constructor(
    public submissionDate: Date,
    public whoSee: objectMini[],
    public whoSubmit: peopleReport[]) {
    }
}

export class peopleReport {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public title: string,
    public file: string,
    public current: string,
    public next: string,
    public delay: string,
    public submitStatus: number) {
    }
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////

export class privateEvent {
  constructor(
    public _id: string,
    public date: Date,
    public title: string,
    public description: string,
    public pics: objectMini[],
  ) {}
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////

export class PersonalInfo {
  constructor(
    // public statusText: string,
    // public statusDate: Date,
    public email: string,
    public phone: string,
    public address: string,
    public birthday: Date,
    public kids: objectMini[],
    public vacations: Vacation[]) {
    }
}

export class Vacation {
  constructor(
    public start: Date,
    public end: Date,
    public where: string) {
    }
}

// *************** Group Analytics ***************

export class Analytics {
  constructor(
    public id: number,
    public name: string,
    public views: number[],
    public secondary: number[],
  ) {}
}

export class privateAnalyticsItems {
  constructor(
    public groups: groupPrivateAnalytic[],
    public fields: Analytics[],
    public positions: Analytics[]
  ) {}
}

export class groupPrivateAnalytic {
  constructor(
    public groupComplex: groupComplex,
    public views: number[],
  ) {}
}
