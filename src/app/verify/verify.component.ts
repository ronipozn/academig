import {Component, OnInit, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Title} from '@angular/platform-browser';

import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';

import {AuthService} from '../auth/auth.service';

@Component({
    selector: 'verify',
    templateUrl: 'verify.html'
})
export class VerifyComponent implements OnInit {
  streamRetrieved: boolean;

  groupLink: string;

  constructor(public titleService: Title,
              private route: ActivatedRoute,
              private _router: Router,
              private http: HttpClient,
              private authService: AuthService) {
    this.titleService.setTitle('Verify Institute Email');
  }

  async ngOnInit() {
    this.streamRetrieved = false;
    const hash = this.route.queryParams['_value'].token;

    this.groupLink = await this.verifyEmail(hash);

    this.streamRetrieved = true;
    this._router.navigate([this.groupLink]);

    // err => this._router.navigate(['/'])
  }

  async verifyEmail(token: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const clientToken = await client.getTokenSilently();

    return this.http.post('/api/verify?token=' + token, null, { headers: { Authorization: `Bearer ${clientToken}` } })
           .toPromise().catch(this.handleError('verifyEmail', []));
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  private log(message: string) { }

}
