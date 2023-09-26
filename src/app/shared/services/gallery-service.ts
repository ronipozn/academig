import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, groupComplex} from './shared-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getGalleries(id: string, mode: number, more: number = 0, text: string = ''): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getGalleries?id=' + id + '&mode=' + mode + '&more=' + more + '&text=' + text, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getGalleries', []));
  }

  async getGalleryDetails(galleryId: string, parentId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/gallery/' + galleryId + '.json?parentId=' + parentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getGalleryDetails', null));
  }

  async putGallery(gallery: Gallery, id: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/gallery.json?id=' + id + '&mode=' + mode, gallery, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putGallery', []));
  }

  async postGallery(gallery: Gallery, id: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/gallery.json?id=' + id + '&mode=' + mode, gallery, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postGallery', []));
  }

  async deleteGallery(itemId: string, id: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/gallery.json?id=' + id + '&itemId=' + itemId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteGallery', []));
  }

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

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////

export class Gallery {
  constructor(
    public _id: string,
    public date: Date,
    public title: string,
    public description: string,
    public pics: objectMini[],
    public group: groupComplex,
    public ai: boolean
  ) {}
}
