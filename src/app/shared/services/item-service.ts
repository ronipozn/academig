import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {PublicInfo, SocialInfo, objectMini, Affiliation} from './shared-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getPodcasts(): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getPodcasts', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPodcasts', []));
  }


  async getEvents(): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getEvents', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getEvents', []));
  }


  async getApps(): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getApps', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getApps', []));
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * param operation - name of the operation that failed
   * param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): T => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return (result as T);
    };
  }

  private log(message: string) { }
}

export class Trend {
  constructor(
    public _id: string,
    public name: string,
    public link: string,
    public pic: string) {
    }
}

export class Event {
  constructor(
    public _id: string,
    public name: string,
    public link: string,
    public pic: string,
    public followStatus: boolean) {
    }
}

export class Podcast {
  constructor(
    public _id: string,
    public name: string,
    public link: string,
    public pic: string,
    public followStatus: boolean) {
    }
}

export class App {
  constructor(
    public stage: number,
    public _id: string,
    public name: string,
    public link: string,
    public pic: string,
    public externalLink: string,
    public description: string,
    public source: string,
    public counters: number[],
    public country: number,
    public state: string,
    public city: string,
    public location: number[],
    public publicInfo: PublicInfo,
    public socialInfo: SocialInfo,
    public followStatus: boolean,
    public team: objectMini[]) {
    }
}
