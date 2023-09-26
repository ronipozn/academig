import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, Period, groupComplex} from './shared-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FundingService {

  // private oldHttp: Http,
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getProfileFundings(peopleId: string): Promise<any> {
    return this.http.get('/api/getProfileFunding?peopleId=' + peopleId)
           .toPromise().catch(this.handleError('getProfileFundings', []));
  }

  async getFundings(id: string, type: number, mode: number, mini: number = 0): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }
    
    return this.http.get('/api/getFundings?id=' + id + '&type=' + type + '&mode=' + mode + '&mini=' + mini, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getFundings', []));
  }

  async putFunding(funding: Funding, groupId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/funding.json?id=' + groupId + '&type=' + type, funding, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putFunding', []));
  }

  async postFunding(funding: Funding, itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/funding.json?id=' + groupId + '&itemId=' + itemId, funding, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postFunding', []));
  }

  async deleteFunding(itemId: string, groupId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/funding.json?id=' + groupId + '&itemId=' + itemId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteFunding', []));
  }

  async putFundingRoles(fundingId: string, groupId: string, roles: fundingRole[]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/fundingRoles.json?fundingId=' + fundingId + '&id=' + groupId, roles, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putFundingRoles', []));
  }

  async postFundingRole(fundingId: string, type: number, description: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/fundingRole.json?fundingId=' + fundingId, {'type': type, 'description': description}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postFundingRole', []));
  }

  async deleteFundingRole(fundingId: string, roleId: string, groupId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/fundingRole.json?fundingId=' + fundingId + '&roleId=' + roleId + '&id=' + groupId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteFundingRole', []));
  }

  async putFundingGroup(fundingId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/fundingGroup.json?fundingId=' + fundingId + '&id=' + groupId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putFundingGroup', []));
  }

  async deleteFundingGroup(fundingId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/fundingGroup.json?fundingId=' + fundingId + '&id=' + groupId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteFundingGroup', []));
  }

  async queryFundings(term: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    var termReg = term.replace(/[^\w\s]/gi, '');

    return this.http.get('/api/queryFundings?term=' + termReg, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('queryFundings', []));
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

export class fundingRole {
  constructor(
    public member: objectMini,
    public type: number, // 0 - none
                         // 1 - PI
                         // 2 - Coordinator
                         // 3 - Speaker
    public status: number, // 0 - invite
                           // 1 - declined
                           // 2 - accepted
    public description: string
  ) {}
}

export class fundingPeriods extends Period {
  constructor(
    public start: Date,
    public end: Date,
    public mode: number,
    public amount: number,
    public currency: number
  ) {
    super(start, end, mode);
  }
}

export class Funding {
  constructor(
    public _id: string,
    public name: string,
    public groups: groupComplex[],
    public officalId: number,
    public pic: string,
    public abbr: string,
    public link: string,
    public description: string,
    public totalAmounts: number[],
    public periods: fundingPeriods[],
    public roles: fundingRole[],
    public projects: objectMini[],
    public ai: boolean) {
  }
}

export class FundingProfile {
  constructor(
    public _id: string,
    public period: Period,
    public name: string,
    public pic: string,
    public link: string,
    public abbr: string,
    public officalId: number,
    public description: string
  ) {
    }
}
