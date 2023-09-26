import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, Period, groupComplex} from './shared-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TeachingService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getTeachings(mode: number, id: string, type: number = 0, text: string = ''): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getTeachings?id=' + id + '&mode=' + mode + '&type=' + type + '&text=' + text, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getTeachings', []));
  }

  async putTeaching(teaching: CreateTeaching, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/teaching.json?type=' + type, teaching, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putTeaching', []));
  }

  async postTeaching(teaching: UpdateTeaching, parentId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/teaching.json?id=' + parentId + '&type=' + type, teaching, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postTeaching', []));
  }

  async deleteTeaching(itemId: string, parentId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/teaching.json?id=' + parentId + '&itemId=' + itemId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTeaching', []));
  }

  async moveTeaching(itemId: string, parentId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/teachingMove.json?id=' + parentId + '&itemId=' + itemId + '&type=' + type, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('moveTeaching', []));
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

export class CreateTeaching {
  constructor(
    public period: Period,
    public id: string,
    public name: string,
    public pic: string,
    public role: number,
    public location: string,
    public description: string,
    public university: string,
    public parentId: string,
    public ai: boolean) {
  }
}

export class UpdateTeaching {
  constructor(
    public _id: string,
    public period: Period,
    public id: string,
    public name: string,
    public pic: string,
    public location: string,
    public role: number,
    public description: string,
    public university: string) {
  }
}

export class Teaching {
  constructor(
    public _id: string,
    public period: Period,
    public id: string,
    public name: string,
    public pic: string,
    public location: string,
    public role: number,
    public description: string,
    public university: string,
    public group: groupComplex,
    public profile: objectMini,
    public views: number[],
    public followStatus: boolean) {
    }
}

export class TeachingDetails {
  constructor(
    public _id: string ) {
  }
}
