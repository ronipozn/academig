import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

@Injectable({
  providedIn: "root"
})
export class MorningService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async putStory(submitStory): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/story.json', submitStory, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putStory', []));
  }

  async getStoryDetails(year: string, month: string, day: string, storyId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/story/' + storyId + '.json?year=' + year+ '&month=' + month+ '&day=' + day, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getStoryDetails', null));
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

export class news {
  constructor(
    public parent: string,
    public id: string,
    public name: string,
    // public pic: string
  ) {}
}

export class SubmitNews {
  constructor(
    public eventName: string,
    public eventURL: string,
    public eventMarkets: string,
    public eventType: number,
    public eventDescription: string,
    public eventBenefits: string,
    public eventYear: number,
    public eventUsers: number,

    public email: string,
    public twitter: string,
    public firstName: string,
    public lastName: string,
    public role: string,

    public goal: number,

    public referred: string,
    public comments: string) {
  }
}
