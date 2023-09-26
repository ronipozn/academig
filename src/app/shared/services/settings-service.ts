import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, groupComplex} from './shared-service';
import {Rank} from './university-service';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ////////////////////////////////////
  ////////////////////////////////////
  /////////// Group Settings /////////
  ////////////////////////////////////
  ////////////////////////////////////

  // groupAccount
  async getGroupAccount(groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/groupAccount?id=' + groupId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getGroupAccount', []));
  }

  async postGroupPrivacy(groupId: string, type: number, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/groupPrivacy.json?id=' + groupId + '&type=' + type + '&mode=' + mode, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postGroupPrivacy', []));
  }

  async postGroupData(groupId: string, topic: string, establish: Date, size: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/groupData.json?id=' + groupId, { "topic": topic, "establish": establish, "size": size }, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postGroupData', []));
  }

  ///////////////////////////////////

  // boolean[]
  async getGroupNotifications(groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/groupNotifications?id=' + groupId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getGroupNotifications', []));
  }

  async toogleGroupNotifications(groupId: string, index: number, state: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/groupNotifications.json?id=' + groupId + '&index=' + index + '&state=' + state, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('toogleGroupNotifications', []));
  }

  ///////////////////////////////////

  // getGroupTabs(groupId: string): Observable<number[]> {
  //   return this.http.get('/api/v1/groupTabs?id='+groupId)
  //     .map(response => response.json().data);
  // }

  // putGroupTab(tab: number, type: number, groupId: string): Observable<string> {
  //   let headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   return this.http.put('/api/v1/groupTab.json?id='+groupId+'&type='+type, JSON.stringify(tab), {headers: headers})
  //     .map(response => response.json().data);
  // }

  ////////////////////////////////////
  ////////////////////////////////////
  /////////// User Settings //////////
  ////////////////////////////////////
  ////////////////////////////////////

  async getUserAccount(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/userAccount', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getUserAccount', []));
  }

  async requestUserData(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/userData.json', null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('requestUserData', []));
  }

  async postEmail(groupId: string, email: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/email.json?groupId=' + groupId, {'email': email}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postEmail', []));
  }

  async postLibraryPrivacy(mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/libraryPrivacy.json?mode=' + mode, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postLibraryPrivacy', []));
  }

  ///////////////////////////////////

  async resetUserPassword(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/userPassword.json', null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('resetUserPassword', []));
  }

  async userDelete(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/people.json', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('userDelete', []));
  }

  ///////////////////////////////////

  // boolean[]
  async getUserNotifications(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/userNotifications', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getUserNotifications', []));
  }

  async toogleNotification(index: number, state: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/userNotification.json?index=' + index + '&state=' + state, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('toogleNotification', []));
  }

  ///////////////////////////////////

  // Report[]
  async getUserReports(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/userReports', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getUserReports', []));
  }

  async putReport(mode: number, item: objectMini, group: groupComplex, type: number, message: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    if (mode==0) {

      return this.http.put('/api/userReport.json?mode=' + mode + '&type=' + type, {'group': group, 'message': message}, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('putReport', []));

    } else {

      return this.http.put('/api/userReport.json?mode=' + mode + '&type=' + type, {'item': item, 'message': message}, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('putReport', []));

    }
  }

  async postReport(itemId: string, reply: string, status: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/userReport.json?itemId=' + itemId + '&status=' + status, {'reply': reply}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getUserReports', []));
  }

  async deleteReport(itemId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/userReport.json?itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteReport', []));
  }

  ///////////////////////////////////

  // objectMini[]
  async getUserBlocks(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/userBlocks', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getUserBlocks', []));
  }

  ////////////////////////////////////
  ////////////////////////////////////
  /////////////// Stripe /////////////
  ////////////////////////////////////
  ////////////////////////////////////

  async postStripeSource(mode: number, id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/stripeSource.json?mode=' + mode + '&id=' + id, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postStripeSource', []));
  }

  async postStripeSubscribe(mode: number, period: number, type: number, quantity: number, id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/stripeSubscribe.json?mode=' + mode + '&period=' + period + '&type=' + type + '&quantity=' + quantity + '&id=' + id, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postStripeSubscribe', []));
  }

  async getStripePortal(mode: number, id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/stripePortal?mode=' + mode + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getStripePortal', []));
  }

  async getStripePlan(mode: number, id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/stripePlan?mode=' + mode + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getStripePlan', []));
  }

  async getStripePayment(mode: number, id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/stripePayment?mode=' + mode + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getStripePayment', []));
  }

  // async postGroupSubscribe(period: number, type: number, sites: number, freeIds: string[]): Promise<any> {
  //   const client = await this.authService.getAuth0Client();
  //   const token = await client.getTokenSilently();
  //
  //   return this.http.post('/api/userGroupSubscribe.json?mode=' + period + '&type=' + type + '&quantity=' + sites, {'freeIds': freeIds}, { headers: { Authorization: `Bearer ${token}` } })
  //          .toPromise().catch(this.handleError('postGroupSubscribe', []));
  // }

  // async postResearcherSubscribe(period: number, type: number): Promise<any> {
  //   const client = await this.authService.getAuth0Client();
  //   const token = await client.getTokenSilently();
  //
  //   return this.http.post('/api/userResearcherSubscribe.json?mode=' + period + '&type=' + type, null, { headers: { Authorization: `Bearer ${token}` } })
  //          .toPromise().catch(this.handleError('postResearcherSubscribe', []));
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

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////

export class groupAccount {
  constructor(
    public dates: Date[],
    public membersCount: string,
    public interests: string[],
    public topic: string,
    public establish: Date,
    public size: number,
    public rank: Rank,
    public buildPro: boolean,
    public interview: Interview,
    public club: Club,
    public privacy: number,
    public seminarsPrivacy: number,
    public kitPrivacy: number) {
    }
}

export class Interview {
  constructor(
    public status: boolean,
    public email: string) {
    }
}

export class Club {
  constructor(
    public status: boolean,
    public email: string,
    public phone: string,
    public address: string,
    public time: string) {
    }
}

export class userAccount {
  constructor(
    public country: string,
    public data: userData) {
    }
}

export class userData {
  constructor(
    public date: Date,
    public flag: boolean) {
    }
}

export class Report {
  constructor(
   public _id: string,
   public date: string,
   public type: number, // 0 - Spam
                        // 1 - Fake
                        // 2 - Offensive
   public mode: number, // 0 - people
                        // 1 - group
                        // 2 - publications
                        // 3 - resources
                        // 4 - projects
                        // 5- positions
   public status: number, // 0 - Pending
                          // 1 - Approve
                          // 2 - Declined
   public message: string,
   public item: objectMini,
   public group: groupComplex) {
   }
}


export class Plan {
  constructor(
    public card: Card,
    public period_end: number,
    public subscription: Subscription, // main group plan
    public subscriptions: Subscription[], // job posting
    public groups: groupsPlan[]) {
    }
}

export class groupsPlan {
  constructor(
    public plan: number,
    public groupIndex: groupComplex) {
    }
}

export class Payment {
  constructor(
    public card: Card,
    public invoices: Invoice[]) {
    }
}

export class Card {
  constructor(
    public address: string,
    public brand: string,
    public city: string,
    public country: string,
    // public email: string,
    public last4: number,
    public name: string,
    public state: string,
    public vat: number,
    public zip: number,
    ) {
    }
}

export class Invoice {
  constructor(
    public date: number,
    public id: string,
    public paid: boolean,
    public total: number) {
    }
}

export class Subscription {
  constructor(
    public amount: number,
    public interval: string,
    public nickname: string,
    public plan: number,
    public quantity: number,
    public status: string,
    public trial_start: number,
    public trial_end: number,
    public created: any, // FIX
    public end: any, // FIX
  ) {
    }
}
