import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {PublicInfo, SocialInfo, complexName, objectMini, Affiliation} from './shared-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getDepartmentByURL(departmentUrl: string): Promise<any> {
    return this.http.get('/api/' + departmentUrl)
           .toPromise().catch(this.handleError('getDepartmentByURL', null));
  }

  async getContactsPageByDepartmentId(departmentId: string): Promise<any> {
    return this.http.get('/api/getContactsPage?mode=1&id=' + departmentId)
           .toPromise().catch(this.handleError('getContactsPageByDepartmentId', []));
  }

  async getDepartmentAccount(departmentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/departmentAccount?id=' + departmentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getDepartmentAccount', []));
  }

  async deleteDepartment(departmentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/department.json?id=' + departmentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getDepartmentAccount', []));
  }

  // postDepartmentMini(departmentId: string, text: string, pic: string): Observable<string> {
  //   let headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   return this.http.post('/api/v1/department.json?id='+departmentId, JSON.stringify({text: text, pic: pic}), {headers: headers})
  //     .map(response => response.json().data);
  // }

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

export class departmentAccount {
  constructor(
    public stage: number,
    public description: string,
    public source: string,
    public externalLink: string,
    // public dates: Date[],
    // public groups: number,
    ) {
    }
}

export class departmentComplex {
  constructor(
    public department: complexName,
    public university: complexName) {
    }
}

export class Department {
  constructor(
    public _id: string,
    public type: number, // 0 - Department
                         // 1 - Program
                         // 2 -Center
    public stage: number, // 0 - waiting for approval
                          // 1 - active
    public departmentIndex: departmentComplex,
    public externalLink: string,
    public description: string,
    public source: string,
    public counters: number[],
    public pics: objectMini[],
    public country: number,
    public state: string,
    public city: string,
    public location: number[],
    public publicInfo: PublicInfo,
    public socialInfo: SocialInfo) {
    }
}

export class groupsItems {
  constructor(
    public groupsIds: number[]) {
    }
}

export class contactsPageItems {
  constructor(
    public findUs: string,
    public findUsPic: string,
    public findUsCaption: string) {
    }
}
