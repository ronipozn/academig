import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DealService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getDeals(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getDeals', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getDeals', []));
  }

  async getDealDetails(itemId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/deal/' + itemId + '.json', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getDealDetails', null));
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  // async postDeal(teaching: any, parentId: string, type: number): Promise<any> {
  //   const client = await this.authService.getAuth0Client();
  //   const token = await client.getTokenSilently();
  //
  //   return this.http.post('/api/app.json?id=' + parentId + '&type=' + type, teaching, { headers: { Authorization: `Bearer ${token}` } })
  //          .toPromise().catch(this.handleError('postTeaching', []));
  // }

  async putTldr(itemId: string, type: number, tldr: string[]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/tldr.json?type=' + type + '&id=' + itemId, tldr, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putTldr', []));
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  async putDeal(itemId: string, type: number, deal: any): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/deal.json?type=' + type + '&id=' + itemId, deal, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putDeal', []));
  }

  async putPlan(itemId: string, type: number, index: number, plan: any): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/dealPlan.json?type=' + type + '&id=' + itemId + '&index=' + index, plan, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPlan', []));
  }

  //////////////////////////////////////////
  ////////////////// Status ////////////////
  //////////////////////////////////////////

  async postStatus(itemId: string, status: number, date: Date): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/dealStatus.json?status=' + status + '&id=' + itemId, {"date": date}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('dealApprove', []));
  }

  async postEmail(mentorId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/dealEmail.json?type=' + type + '&id=' + mentorId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postEmail', []));
  }

  //////////////////////////////////////////
  //////////////////// Buy /////////////////
  //////////////////////////////////////////

  async postStripeBuy(itemId: string, quantity: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/stripeDeal.json?quantity=' + quantity + '&id=' + itemId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPlan', []));
  }

  //////////////////////////////////////////
  //////////////////////////////////////////
  //////////////////////////////////////////

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

export let DealType: string[] = [
  'Lifetime Deal',
  'Annual',
  'Freebie',
  'Subscription',
  'Digital Download',
];

// export class CreateDeal {
//   constructor(
//     public period: Period,
//     public id: string,
//     public name: string,
//     public pic: string,
//     public role: number,
//     public location: string,
//     public description: string,
//     public university: string,
//     public parentId: string,
//     public ai: boolean) {
//   }
// }
//
