import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, Period} from './shared-service';
import {Group} from './group-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getCollaborations(id: string, type: number, mini: number = 0): Promise<any> {
    return this.http.get('/api/getCollaborations?id=' + id + '&type=' + type + '&mini=' + mini)
           .toPromise().catch(this.handleError('getCollaborations', []));
  }

  async getCollaborationsMini(id: string): Promise<any> {
    return this.http.get('/api/getCollaborations?id=' + id + '&type=2&mini=3')
           .toPromise().catch(this.handleError('getCollaborationsMini', []));
  }

  async getSponsors(id: string, type: number): Promise<any> {
    return this.http.get('/api/getSponsors?id=' + id + '&type=' + type)
           .toPromise().catch(this.handleError('getSponsors', []));
  }

  async putCollaboration(collaboration: Collaboration, groupId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/collaboration.json?id=' + groupId + '&type=' + type, collaboration, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putCollaboration', []));
  }

  async postCollaboration(collaboration: Collaboration, itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/v1/collaboration.json?itemId=' + itemId + '&id=' + groupId, collaboration, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postCollaboration', []));
  }

  async deleteCollaboration(itemId: string, groupId: string, type: number, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/v1/collaboration.json?id=' + groupId + '&itemId=' + itemId + '&type=' + type + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteCollaboration', []));
  }

  async putSponsor(sponsor: Sponsor, groupId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/sponsor.json?id=' + groupId + '&type=' + type, sponsor, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putSponsor', []));
  }

  async postSponsor(sponsor: Sponsor, itemId: string, groupId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/sponsor.json?id=' + groupId + '&itemId=' + itemId + '&type=' + type, sponsor, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postSponsor', []));
  }

  async deleteSponsor(itemId: string, groupId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/sponsor.json?id=' + groupId + '&itemId=' + itemId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteSponsor', []));
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

export class Collaboration {
  constructor(
    public _id: string,
    public status: number, // 0 - invite
                           // 1 - decline
                           // 2 - accept
    public groupsIds: string[],
    public period: Period,
    public projects: objectMini[],
    public text: string,
    public ai: boolean) {
    }
}

export class Sponsor {
  constructor(
    public _id: string,
    public period: Period,
    public projects: objectMini[],
    public name: string,
    public link: string) {
    }
}
