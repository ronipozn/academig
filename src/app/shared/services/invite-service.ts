import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMiniEmail} from './shared-service';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

@Injectable({
  providedIn: 'root'
})
export class InviteService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async authorInvite(mode: number, itemId: string, author: objectMiniEmail): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/invite.json?mode=' + mode + '&itemId=' + itemId, author, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('authorInvite', []));
  }

  async pullPeopleInvites(mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/manageInvites.json?mode=' + mode, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('pullPeopleInvites', []));
  }

  async authorSuggest(itemId: string, Coauthor: objectMiniEmail): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/suggest.json?itemId=' + itemId, Coauthor, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('authorSuggest', []));
  }

  async colleagueInvite(email: string, message: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/colleague.json?email=' + email, {"message": message}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('authorSuggest', []));
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
