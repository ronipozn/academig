import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getFAQ(parentId: string, mode: number): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }
    
    return this.http.get('/api/getQuestions?id=' + parentId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getFAQ', []));
  }

  async putFAQ(faq: FAQ, parentId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/faq.json?id=' + parentId + '&mode=' + mode, faq, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putFAQ', []));
  }

  async postFAQ(faq: FAQ, itemId: string, parentId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/faq.json?itemId=' + itemId + '&id=' + parentId + '&mode=' + mode, faq, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putFAQ', []));
  }

  async deleteFAQ(itemId: string, parentId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/faq.json?id=' + parentId + '&itemId=' + itemId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putFAQ', []));
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

export class FAQ {
  constructor(
    public _id: string,
    public question: string,
    public answer: string,
    public ai: boolean) {
    }
}
