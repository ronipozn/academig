import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini} from './shared-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  // MODE:
  // 0 - university
  // 1 - department
  // 2 - group

  async getContacts(mode: number, id: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getContacts?mode=' + mode + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getContacts', []));
  }

  async putContact(mode: number, contact: Contact, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/contact.json?mode=' + mode + '&id=' + groupId, contact, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putContact', []));
  }

  async postContact(mode: number, contact: Contact, itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/contact.json?mode=' + mode + '&id=' + groupId + '&itemId=' + itemId, contact, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postContact', []));
  }

  async deleteContact(mode: number, itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/contact.json?mode=' + mode + '&id=' + groupId + '&itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteContact', []));
  }

  async putContactMessage(parentId: string, mode: number, subject: string, message: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/contactMessage.json?id=' + parentId + '&mode=' + mode, {'subject': subject, 'message': message}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putContact', []));
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

export class Contact {
  constructor(
    public _id: string,
    public title: number,
    public pic: string,
    public mode: number,
    public member: objectMini,
    public address: string,
    public phone: string,
    public fax: string,
    public email: string,
    public ai: boolean) {
    }
}
