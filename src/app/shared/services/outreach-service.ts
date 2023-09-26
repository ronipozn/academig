import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, Period, groupComplex} from './shared-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OutreachService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getOutreachs(mode: number, id: string, type: number = 0, text: string = ''): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getOutreach?id=' + id + '&mode=' + mode + '&type=' + type + '&text=' + text, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getOutreachs', []));
  }

  async putOutreach(outreach: CreateOutreach, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/outreach.json?type=' + type, outreach, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putOutreach', []));
  }

  async postOutreach(outreach: UpdateOutreach, parentId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/outreach.json?id=' + parentId + '&type=' + type, outreach, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postOutreach', []));
  }

  async deleteOutreach(itemId: string, parentId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/outreach.json?id=' + parentId + '&itemId=' + itemId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteOutreach', []));
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

export class CreateOutreach {
  constructor(
    public name: string, // Title
    public period: Period,
    public link: string,
    public pic: string,
    public caption: string,
    public clip: string,
    public location: string,
    public description: string,
    public parentId: string,
    public ai: boolean) {
  }
}

export class UpdateOutreach {
  constructor(
    public _id: string,
    public period: Period,
    public name: string,
    public link: string,
    public pic: string,
    public caption: string,
    public clip: string,
    public location: string,
    public description: string) {
  }
}

export class Outreach {
  constructor(
    public _id: string,
    public period: Period,
    public name: string,
    public link: string,
    public pic: string,
    public caption: string,
    public clip: string,
    public location: string,
    public description: string,
    public group: groupComplex,
    public views: number[],
    public followStatus: boolean) {
    }
}
