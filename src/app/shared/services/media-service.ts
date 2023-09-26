import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, groupComplex} from './shared-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getMedia(mode: number, id: string, type: number, mini: number = 0, more: number = 0, text: string = ''): Promise<any> { // any[] FIX
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getMedia?mode=' + mode + '&id=' + id + '&type=' + type + '&mini=' + mini+ '&more=' + more + '&text=' + text, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMedia', []));
  }

  async putMedia(talk: Talk, poster: Poster, press: Press, id: string, mode: number, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/media.json?id=' + id + '&mode=' + mode + '&type=' + type, (type == 0) ? talk : ((type == 1) ? poster : press), { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMedia', []));
  }

  async postMedia(talk: Talk, poster: Poster, press: Press, id: string, itemId: string, mode: number, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/media.json?id=' + id + '&itemId=' + itemId + '&mode=' + mode + '&type=' + type, (type == 0) ? talk : ((type == 1) ? poster : press), { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMedia', []));
  }

  async deleteMedia(itemId: string, id: string, mode: number, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/media.json?id=' + id + '&itemId=' + itemId + '&mode=' + mode + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMedia', []));
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

export class Talk {
  constructor(
    public _id: string,
    public title: string,
    public location: string,
    public date: Date,
    public text: string,
    public link: string,
    public linkConvert: string,
    public presentors: objectMini[],
    public projects: objectMini[],
    public group: groupComplex,
    public profile: objectMini,
    public ai: boolean) {
    }
}

export class Poster {
  constructor(
    public _id: string,
    public title: string,
    public abstract: string,
    public authors: objectMini[],
    public location: string,
    public date: Date,
    public embed: string,
    public projects: objectMini[],
    public group: groupComplex,
    public profile: objectMini,
    public ai: boolean) {
    }
}

export class Press {
  constructor(
    public _id: string,
    public title: string,
    public abstract: string,
    public source: string,
    public date: Date,
    public link: string,
    public projects: objectMini[],
    public group: groupComplex,
    public profile: objectMini,
    public ai: boolean) {
    }
}
