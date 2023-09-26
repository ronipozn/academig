import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Publication} from './publication-service';

import {FormControl, Validators, ValidationErrors, ValidatorFn} from '@angular/forms';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  //////////////////////////////////////////
  /////////////////// CSV //////////////////
  //////////////////////////////////////////

  async uploadCSV(file: string, id: string, university: string, department: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/csv.json?mode=' + mode, {'id': id, 'file': file, 'university': university, 'department': department}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putDomain', []));
  }

  //////////////////////////////////////////
  ////////////////// Domain ////////////////
  //////////////////////////////////////////

  async putDomain(parentId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/domain.json?mode=' + mode + '&id=' + parentId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putDomain', []));
  }

  //////////////////////////////////////////
  ///////////////// Twitter ////////////////
  //////////////////////////////////////////

  // https://www.npmjs.com/package/ngx-twitter-timeline
  async updateTwitter(mode: number, parentId: string, feed: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/twitter.json?mode=' + mode + '&id=' + parentId, {'feed': feed}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('updateTwitter', []));
  }

  //////////////////////////////////////////
  //////////////// Home Page ///////////////
  //////////////////////////////////////////

  async getHomePage(id: string, mode: number): Promise<any> {
    return this.http.get('/api/getHomePage?mode=' + mode + '&id=' + id)
           .toPromise().catch(this.handleError('getHomePage', []));
  }

  //////////////////////////////////////////
  ///////////////// Location ///////////////
  //////////////////////////////////////////

  async updateLocation(mode: number, parentId: string, lat: string, lng: string, country_id: number, state: string, city: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/location.json?mode=' + mode + '&id=' + parentId, {'lat': lat, 'lng': lng, 'country': country_id, 'state': state, 'city': city}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('updateLocation', []));
  }

  async queryCoordinates(term: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/queryCoordinates?term=' + term, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('queryCoordinates', []));
  }

  //////////////////////////////////////////
  ////////////////// Topics ////////////////
  //////////////////////////////////////////

  // string[]
  async queryTopics(term: string = null): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/queryTopics?term=' + term, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('queryTopics', []));
  }

  //////////////////////////////////////////
  ////////////////// Info //////////////////
  //////////////////////////////////////////

  // string[]
  async postPublicInfo(publicInfo: PublicInfo, mode: number, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/publicInfo.json?mode=' + mode + '&id=' + parentId, publicInfo, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postPublicInfo', []));
  }

  // string[]
  async postSocialInfo(socialInfo: SocialInfo, mode: number, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/socialInfo.json?mode=' + mode + '&id=' + parentId, socialInfo, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postSocialInfo', []));
  }

  //////////////////////////////////////////
  ///////////////// Claims /////////////////
  //////////////////////////////////////////

  async putClaim(mode: number, itemId: string, name: string, message: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/claim.json?mode=' + mode + '&id=' + itemId, {"name": name, "message": message}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putClaim', []));
  }

  //////////////////////////////////////////
  ///////////////// Logging ////////////////
  //////////////////////////////////////////

  async putLogging(type: number, itemId: string, message: string): Promise<any> {
    // type: 0 - University: Improve Page
    //       1 - Department: Improve Page

    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.put('/api/logging.json?type=' + type + '&id=' + itemId, {"message": message}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putLogging', []));
  }

  //////////////////////////////////////////
  ////////////////// Title /////////////////
  //////////////////////////////////////////

  async updateTitle(mode: number, itemId: string, parentId: string, title: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/title.json?mode=' + mode + '&itemId=' + itemId + '&id=' + parentId, {'title': title}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('updateTitle', []));
  }

  //////////////////////////////////////////
  ////////////////// Mini //////////////////
  //////////////////////////////////////////

  async updateMinis(mode: number, type: number, itemId: string, parentId: string, minis: objectMini[]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/mini.json?mode=' + mode + '&type=' + type + '&itemId=' + itemId + '&id=' + parentId, minis, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('updateMinis', []));
  }

  //////////////////////////////////////////
  ////////////////// Tags //////////////////
  //////////////////////////////////////////

  async postTags(mode: number, tags: string[], itemId: string, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/tags.json?itemId=' + itemId + '&id=' + parentId + '&mode=' + mode, tags, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postTags', []));
  }

  async deleteTags(mode: number, itemId: string, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/tags.json?itemId=' + itemId + '&id=' + parentId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTags', []));
  }

  //////////////////////////////////////////
  //////////////// Pictures ////////////////
  //////////////////////////////////////////

  async postPic(mode: number, itemId: string, pics: string[]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/pics.json?id=' + itemId + '&mode=' + mode, pics, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTags', []));
  }

  async deletePic(mode: number, itemId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/pics.json?id=' + itemId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTags', []));
  }

  //////////////////////////////////////////
  /////////////// Text + Pic //////////////
  //////////////////////////////////////////

  async postTextPic(mode: number, itemId: string, parentId: string, text: string, pic: string, caption: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/textpic.json?itemId=' + itemId + '&id=' + parentId + '&mode=' + mode, {text: text, pic: pic, caption: caption}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTags', []));
  }

  async deleteTextPic(mode: number, itemId: string, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/textpic.json?itemId=' + itemId + '&id=' + parentId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTags', []));
  }

  //////////////////////////////////////////
  /////////////////// Text /////////////////
  //////////////////////////////////////////

  async postText(text: string, itemId: string, parentId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/text.json?itemId=' + itemId + '&id=' + parentId + '&type=' + type, {'text': text}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTags', []));
  }

  async deleteText(itemId: string, parentId: string,  type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/text.json?itemId=' + itemId + '&id=' + parentId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTags', []));
  }

  //////////////////////////////////////////
  //////////////// Showcase ////////////////
  //////////////////////////////////////////

  // string[]
  async putShowcase(mode: number, itemId: string, parentId: string, elements: objectMini[]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/showcase.json?id=' + parentId + '&itemId=' + itemId + '&mode=' + mode, elements, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putShowcase', []));
  }

  // FIX?
  // string[]
  async putShowcaseFigures(mode: number, itemId: string, parentId: string, elements: objectMiniType[]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/showcase.json?id=' + parentId + '&itemId=' + itemId + '&mode=' + mode, elements, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putShowcaseFigures', []));
  }

  async postShowcase(mode: number, itemId: string, parentId: string, element: objectMini): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/showcase.json?id=' + parentId + '&itemId=' + itemId + '&mode=' + mode, element, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postShowcase', []));
  }

  async deleteShowcase(mode: number, itemId: string, parentId: string, elementId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/showcase.json?id=' + parentId + '&itemId=' + itemId + '&elementId=' + elementId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteShowcase', []));
  }

  //////////////////////////////////////////
  ////////////////// Quote /////////////////
  //////////////////////////////////////////

  async postQuote(quote: Quote, parentId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/quote.json?id=' + parentId + '&mode=' + mode, quote, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postQuote', []));
  }

  async deleteQuote(parentId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/quote.json?id=' + parentId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteQuote', []));
  }

  //////////////////////////////////////////
  ////////////////// Links /////////////////
  //////////////////////////////////////////

  async putLink(link: Link, id: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/link.json?id=' + id + '&type=' + type, link, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putLink', []));
  }

  async postLink(link: Link, id: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/link.json?id=' + id + '&type=' + type, link, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postLink', []));
  }

  async deleteLink(itemId: string, id: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/link.json?id=' + id + '&itemId=' + itemId + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteLink', []));
  }

  //////////////////////////////////////////
  /////////////// Affiliation //////////////
  //////////////////////////////////////////

  async putAffiliation(affiliation: Affiliation, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/affiliation.json?id=' + parentId, affiliation, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putAffiliation', []));
  }

  async postAffiliation(affiliation: Affiliation, parentId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/affiliation.json?id=' + parentId + '&mode=' + mode, affiliation, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postAffiliation', []));
  }

  async deleteAffiliation(itemId: string, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/affiliation.json?id=' + parentId + '&itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteAffiliation', []));
  }

  //////////////////////////////////////////
  ///////////// Institute Stage ////////////
  //////////////////////////////////////////

  async postStage(parentId: string, stage: number, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/stage.json?id=' + parentId + '&mode=' + mode, {"stage": stage}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postStage', []));
  }

  //////////////////////////////////////////
  /////////////// Co-Authors ///////////////
  //////////////////////////////////////////

  // objectMini[]
  async getCoAuthors(mode: number, parentId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getCoAuthors?mode=' + mode + '&parentId=' + parentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getCoAuthors', []));
  }

  //////////////////////////////////////////
  //////////////// Languages ///////////////
  //////////////////////////////////////////

  // string[]
  async getLanguages(term: string = null): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getLanguages?term=' + term, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getLanguages', []));
  }

  //////////////////////////////////////////
  ////////////////// Legal /////////////////
  //////////////////////////////////////////

  // https://stackoverflow.com/questions/39574305/property-body-does-not-exist-on-type-response
  async getPolicy(): Promise<any> {
    return this.http.get('https://www.iubenda.com/api/privacy-policy/11601199/no-markup')
           .toPromise().catch(this.handleError('getPolicy', []));
  }

  //////////////////////////////////////////
  ///////// Uploadcare Group Info //////////
  //////////////////////////////////////////

  async queryUploadcareGroupInfo(id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getPicsInfo?elementId=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('queryUploadcareGroupInfo', []));

    // const pubKey = environment.uploadecare.key;
    // const groupSub = groupId.substring(21, 59);

    // return this.http.get('https://upload.uploadcare.com/group/info/?pub_key=' + pubKey + `\&group_id=` + groupSub, { headers: { Authorization: `Bearer ${token}` } })
           // .toPromise().catch(this.handleError('queryUploadcareGroupInfo', []));

    // return this.oldHttp.get(`https://upload.uploadcare.com/group/info/?pub_key=` + pubKey + `\&group_id=` + groupSub , { headers: this.getHeaders() })
    //   .map(response => response.json().files.map(r => r.uuid));
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

  private log(message: string) {
    // this.messageService.add(`HeroService: ${message}`);
  }

  public convertMedia(html: string) {
     const pattern1 = /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(.+)/g;
     const pattern2 = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;

     var htmlConvert = '';
     var replacement: string;

     // https://stackoverflow.com/questions/5631384/remove-everything-after-a-certain-character
     var n = html.indexOf('&');
     var htmlNew = html.substring(0, n != -1 ? n : html.length);

     if (pattern1.test(html)) {
       replacement = '//player.vimeo.com/video/$1';
       htmlConvert = htmlNew.replace(pattern1, replacement);
     }

     if (pattern2.test(html)) {
       replacement = 'https://www.youtube.com/embed/$1';
       htmlConvert = htmlNew.replace(pattern2, replacement);
     }

     return htmlConvert;
  }

}

@Injectable()
export class ValidatorsService {
  // TBD: pay attention to the BAD programming. Validator is resticted to specific control names (start, end)
  rangeValidator(error: ValidationErrors): ValidatorFn {
    return (control: FormControl): {[key: string]: any} => {
      const item = control.parent;
      let startDate, endDate;

      if (!item || !item.controls['end']) return null;
      if (!control.value || item.controls['end'].disabled) return null;
      if (item) {
        startDate = item.controls['start'].value;
        endDate = item.controls['end'].value;
      };
      if (!startDate || !endDate || moment(endDate).isSameOrAfter(moment(startDate), 'day')) return null;

      return {'range': true};
      // return error;
    };
  }
}

@Injectable()
export class ValidatorsReadService {
  // TBD: pay attention to the BAD programming. Validator is resticted to specific control names (date, end)
  rangeValidator(error: ValidationErrors): ValidatorFn {
    return (control: FormControl): {[key: string]: any} => {
      const item = control.parent;
      let startDate, endDate;

      if (!item || !item.controls['end']) return null;
      if (!control.value || item.controls['end'].disabled) return null;
      if (item) {
        startDate = item.controls['date'].value;
        endDate = item.controls['end'].value;
      };
      if (!startDate || !endDate || moment(endDate).isSameOrAfter(moment(startDate), 'day')) return null;

      return {'range': true};
      // return error;
    };
  }
}

export class objectMini {
  constructor(
    public _id: string,
    public name: string,
    public pic: string) {
    }
}

export class objectMiniType extends objectMini {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public type: number) {
    super(_id, name, pic);
  }
}

export class objectMiniEmail extends objectMini {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public email: string,
    public message: string,
    public dates: Date[]
  ) {
    super(_id, name, pic);
  }
}

export class objectMiniPosition extends objectMini {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public email: string,
    public position: number,
    public startDate: Date,
    public endDate: Date,
    public active: boolean[],
    public message: string,
    public messageFlag: boolean[],
  ) {
    super(_id, name, pic);
  }
}

export class objectSendgrid {
  constructor(
    public clicks_count: number,
    public from_email: string,
    public last_event_time: Date,
    public msg_id: string,
    public opens_count: number,
    public status: string,
    public subject: string,
    public to_email: string) {
    }
}

export class Invite {
  constructor(
    public mode: number,
    public group: groupComplex,
    public publication: Publication) {
    }
}

export class groupComplex {
  constructor(
    public group: complexName,
    public department: complexName,
    public university: complexName) {
    }
}

export class complexName {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public link: string) {
    }
}

export class Link {
  constructor(
    public _id: string,
    public name: string,
    public link: string,
    public description: string) {
    }
}

export class Period {
  constructor(
    public start: Date,
    public end: Date,
    public mode: number) { // 0 - stard-end, 1 - start-present, 2 - start
    }
}

export class complexEmail {
  constructor(
    public address: string,
    public updated: Date,
    public stage: number) {
    }
}

export class Quote {
  constructor(
    public text: string,
    public name: string,
    public pic: string) {
    }
}

export class Affiliation {
  constructor(
    public _id: string,
    public title: string,
    public abbr: string,
    public description: string,
    public source: string,
    public externalLink: string,
    public pic: string) {
    }
}

export class ItemsViews {
  constructor(
    public total: number,
    public publications: number,
    public resources: number,
    public projects: number) {
    }
}

export class ItemsCounts {
  constructor(
    public publications: number,
    public resources: number,
    public currentProjects: number,
    public pastProjects: number) {
    }
}

export class Contest {
  constructor(
    public title: string,
    public deadline: number,
    public amount: number,
    public prizes: string,
    public pics: objectMini) {
    }
}

export class Refinements {
  constructor(
    public search_type: string[],
    public type: string[],
    public countries: string[],
    public states: string[],
    public cities: string[],
    public universities: string[],
    public disciplines: string[],
    public interests: string[],
    public positions: string[],
    public size: number[],
    public head: string[],
    public types: string[],
    public languages: string[],
    public categories: string[],
    public establish: number[],
    public times: number[],
    public shanghai: number[],
    public top: number[],
    public usnews: number[],
    public facebook: number[],
    public twitter: number[],
    public linkedin: number[],
    public instagram: number[],
    public youtube: number[]) {
    }
}

export class Plan {
  constructor(
    public status: string,
    public trial_end: number,
    public trial_start: number,
    public plan: number) {
    }
}

export class SocialInfo {
  constructor(
    public linkedin: string,
    public twitter: string,
    public scholar: string,
    public orcid: string,
    public github: string,
    public researchgate: string,
    public facebook: string,
    public youtube: string,
    public pinterest: string,
    public instagram: string) {
    }
}

export class PublicInfo {
  constructor(
    public address: string,
    public email: string,
    public phone: string,
    public fax: string,
    public website: string) {
    }
}

export let Countries = [
  { "id": "0",   "name": "Academig World", "code": "0" },
  { "id": "4",   "name": "Afghanistan", "code": "AF" },
  { "id": "8",   "name": "Albania", "code": "AL" },
  { "id": "12",  "name": "Algeria", "code": "DZ" },
  { "id": "20",  "name": "Andorra", "code": "AD" },
  { "id": "24",  "name": "Angola", "code": "AO" },
  { "id": "660", "name": "Anguilla", "code": "AI" },
  { "id": "28",  "name": "Antigua and Barbuda", "code": "AG" },
  { "id": "32",  "name": "Argentina", "code": "AR" },
  { "id": "51",  "name": "Armenia", "code": "AM" },
  { "id": "533", "name": "Aruba", "code": "AW" },
  { "id": "36",  "name": "Australia", "code": "AU" },
  { "id": "40",  "name": "Austria", "code": "AT" },
  { "id": "31",  "name": "Azerbaijan", "code": "AZ" },
  { "id": "44",  "name": "Bahamas", "code": "BS" },
  { "id": "48",  "name": "Bahrain", "code": "BH" },
  { "id": "50",  "name": "Bangladesh", "code": "BD" },
  { "id": "52",  "name": "Barbados", "code": "BB" },
  { "id": "112", "name": "Belarus", "code": "BY" },
  { "id": "56",  "name": "Belgium", "code": "BE" },
  { "id": "84",  "name": "Belize", "code": "BZ" },
  { "id": "204", "name": "Benin", "code": "BJ" },
  { "id": "60",  "name": "Bermuda", "code": "BM" },
  { "id": "68",  "name": "Bolivia", "code": "BO" },
  { "id": "70",  "name": "Bosnia and Herzegovina", "code": "BA" },
  { "id": "72",  "name": "Botswana", "code": "BW" },
  { "id": "76",  "name": "Brazil", "code": "BR" },
  { "id": "96",  "name": "Brunei", "code": "BN" },
  { "id": "100", "name": "Bulgaria", "code": "BG" },
  { "id": "854", "name": "Burkina Faso", "code": "BF" },
  { "id": "108", "name": "Burundi", "code": "BI" },
  { "id": "116", "name": "Cambodia", "code": "KH" },
  { "id": "120", "name": "Cameroon", "code": "CM" },
  { "id": "124", "name": "Canada", "code": "CA" },
  { "id": "132", "name": "Cape Verde", "code": "CV" },
  { "id": "136", "name": "Cayman Islands", "code": "KY" },
  { "id": "140", "name": "Central African Republic", "code": "CF" },
  { "id": "148", "name": "Chad", "code": "TD" },
  { "id": "152", "name": "Chile", "code": "CL" },
  { "id": "156", "name": "China", "code": "CN" },
  { "id": "170", "name": "Colombia", "code": "CO" },
  { "id": "174", "name": "Comoros", "code": "KM" },
  { "id": "178", "name": "Congo", "code": "CG" },
  { "id": "184", "name": "Cook Islands", "code": "CK" },
  { "id": "188", "name": "Costa Rica", "code": "CR" },
  { "id": "191", "name": "Croatia", "code": "HR" },
  { "id": "192", "name": "Cuba", "code": "CU" },
  { "id": "196", "name": "Cyprus", "code": "CY" },
  { "id": "203", "name": "Czech Republic", "code": "CZ" },
  { "id": "208", "name": "Denmark", "code": "DK" },
  { "id": "262", "name": "Djibouti", "code": "DJ" },
  { "id": "212", "name": "Dominica", "code": "DM" },
  { "id": "214", "name": "Dominican Rep.", "code": "DO" },
  { "id": "218", "name": "Ecuador", "code": "EC" },
  { "id": "818", "name": "Egypt", "code": "EG" },
  { "id": "222", "name": "El Salvador", "code": "SV" },
  { "id": "226", "name": "Eq. Guinea", "code": "GQ" },
  { "id": "232", "name": "Eritrea", "code": "ER" },
  { "id": "233", "name": "Estonia", "code": "EE" },
  { "id": "231", "name": "Ethiopia", "code": "ET" },
  { "id": "242", "name": "Fiji", "code": "FJ" },
  { "id": "246", "name": "Finland", "code": "FI" },
  { "id": "250", "name": "France", "code": "FR" },
  { "id": "266", "name": "Gabon", "code": "GA" },
  { "id": "270", "name": "Gambia", "code": "GM" },
  { "id": "268", "name": "Georgia", "code": "GE" },
  { "id": "276", "name": "Germany", "code": "DE" },
  { "id": "288", "name": "Ghana", "code": "GH" },
  { "id": "292", "name": "Gibraltar", "code": "GI" },
  { "id": "300", "name": "Greece", "code": "GR" },
  { "id": "304", "name": "Greenland", "code": "GL" },
  { "id": "308", "name": "Grenada", "code": "GD" },
  { "id": "312", "name": "Guadeloupe", "code": "GP" },
  { "id": "320", "name": "Guatemala", "code": "GT" },
  { "id": "831", "name": "Guernsey", "code": "GG" },
  { "id": "324", "name": "Guinea", "code": "GN" },
  { "id": "624", "name": "Guinea-Bissau", "code": "GW" },
  { "id": "328", "name": "Guyana", "code": "GY" },
  { "id": "332", "name": "Haiti", "code": "HT" },
  { "id": "340", "name": "Honduras", "code": "HN" },
  { "id": "344", "name": "Hong Kong", "code": "HK" },
  { "id": "348", "name": "Hungary", "code": "HU" },
  { "id": "352", "name": "Iceland", "code": "IS" },
  { "id": "356", "name": "India", "code": "IN" },
  { "id": "360", "name": "Indonesia", "code": "ID" },
  { "id": "364", "name": "Iran", "code": "IR" },
  { "id": "368", "name": "Iraq", "code": "IQ" },
  { "id": "372", "name": "Ireland", "code": "IE" },
  { "id": "833", "name": "Isle of Man", "code": "IM" },
  { "id": "376", "name": "Israel", "code": "IL" },
  { "id": "380", "name": "Italy", "code": "IT" },
  { "id": "388", "name": "Jamaica", "code": "JM" },
  { "id": "392", "name": "Japan", "code": "JP" },
  { "id": "832", "name": "Jersey", "code": "JE" },
  { "id": "400", "name": "Jordan", "code": "JO" },
  { "id": "398", "name": "Kazakhstan", "code": "KZ" },
  { "id": "404", "name": "Kenya", "code": "KE" },
  { "id": "296", "name": "Kiribati", "code": "KI" },
  { "id": "414", "name": "Kuwait", "code": "KW" },
  { "id": "417", "name": "Kyrgyzstan", "code": "KG" },
  { "id": "428", "name": "Latvia", "code": "LV" },
  { "id": "422", "name": "Lebanon", "code": "LB" },
  { "id": "426", "name": "Lesotho", "code": "LS" },
  { "id": "430", "name": "Liberia", "code": "LR" },
  { "id": "434", "name": "Libya", "code": "LY" },
  { "id": "438", "name": "Liechtenstein", "code": "LI" },
  { "id": "440", "name": "Lithuania", "code": "LT" },
  { "id": "442", "name": "Luxembourg", "code": "LU" },
  { "id": "807", "name": "Macedonia", "code": "MK" },
  { "id": "450", "name": "Madagascar", "code": "MG" },
  { "id": "454", "name": "Malawi", "code": "MW" },
  { "id": "458", "name": "Malaysia", "code": "MY" },
  { "id": "462", "name": "Maldives", "code": "MV" },
  { "id": "466", "name": "Mali", "code": "ML" },
  { "id": "470", "name": "Malta", "code": "MT" },
  { "id": "584", "name": "Marshall Islands", "code": "MH" },
  { "id": "474", "name": "Martinique", "code": "MQ" },
  { "id": "478", "name": "Mauritania", "code": "MR" },
  { "id": "480", "name": "Mauritius", "code": "MU" },
  { "id": "175", "name": "Mayotte", "code": "YT" },
  { "id": "484", "name": "Mexico", "code": "MX" },
  { "id": "583", "name": "Micronesia", "code": "FM" },
  { "id": "498", "name": "Moldova", "code": "MD" },
  { "id": "492", "name": "Monaco", "code": "MC" },
  { "id": "496", "name": "Mongolia", "code": "MN" },
  { "id": "499", "name": "Montenegro", "code": "ME" },
  { "id": "500", "name": "Montserrat", "code": "MS" },
  { "id": "504", "name": "Morocco", "code": "MA" },
  { "id": "508", "name": "Mozambique", "code": "MZ" },
  { "id": "104", "name": "Myanmar", "code": "MM" },
  { "id": "516", "name": "Namibia", "code": "NA" },
  { "id": "520", "name": "Nauru", "code": "NR" },
  { "id": "524", "name": "Nepal", "code": "NP" },
  { "id": "528", "name": "Netherlands", "code": "NL" },
  { "id": "554", "name": "New Zealand", "code": "NZ" },
  { "id": "558", "name": "Nicaragua", "code": "NI" },
  { "id": "562", "name": "Niger", "code": "NE" },
  { "id": "566", "name": "Nigeria", "code": "NG" },
  { "id": "570", "name": "Niue", "code": "NU" },
  { "id": "574", "name": "Norfolk Island", "code": "NI" },
  { "id": "410", "name": "North Korea", "code": "KP" },
  { "id": "578", "name": "Norway", "code": "NO" },
  { "id": "512", "name": "Oman", "code": "OM" },
  { "id": "586", "name": "Pakistan", "code": "PK" },
  { "id": "585", "name": "Palau", "code": "PW" },
  { "id": "591", "name": "Panama", "code": "PA" },
  { "id": "598", "name": "Papua New Guinea", "code": "PG" },
  { "id": "600", "name": "Paraguay", "code": "PY" },
  { "id": "604", "name": "Peru", "code": "PE" },
  { "id": "608", "name": "Philippines", "code": "PH" },
  { "id": "616", "name": "Poland", "code": "PL" },
  { "id": "620", "name": "Portugal", "code": "PT" },
  { "id": "630", "name": "Puerto Rico", "code": "PR" },
  { "id": "634", "name": "Qatar", "code": "QA" },
  { "id": "642", "name": "Romania", "code": "RO" },
  { "id": "643", "name": "Russian Federation", "code": "RU" },
  { "id": "646", "name": "Rwanda", "code": "RW" },
  { "id": "659", "name": "Saint Kitts and Nevis", "code": "KN" },
  { "id": "670", "name": "Saint Vincent and the Grenadines", "code": "VC" },
  { "id": "882", "name": "Samoa", "code": "WS" },
  { "id": "674", "name": "San Marino", "code": "SM" },
  { "id": "678", "name": "Sao Tome and Principe", "code": "ST" },
  { "id": "682", "name": "Saudi Arabia", "code": "SA" },
  { "id": "686", "name": "Senegal", "code": "SN" },
  { "id": "688", "name": "Serbia", "code": "RS" },
  { "id": "690", "name": "Seychelles", "code": "SC" },
  { "id": "694", "name": "Sierra Leone", "code": "SL" },
  { "id": "702", "name": "Singapore", "code": "SG" },
  { "id": "703", "name": "Slovakia", "code": "SK" },
  { "id": "705", "name": "Slovenia", "code": "SI" },
  { "id": "90",  "name": "Solomon Is.", "code": "SB" },
  { "id": "706", "name": "Somalia", "code": "SO" },
  { "id": "710", "name": "South Africa", "code": "ZA" },
  { "id": "410", "name": "South Korea", "code": "KR" },
  { "id": "724", "name": "Spain", "code": "ES" },
  { "id": "144", "name": "Sri Lanka", "code": "LK" },
  { "id": "736", "name": "Sudan", "code": "SD" },
  { "id": "740", "name": "Suriname", "code": "SR" },
  { "id": "744", "name": "Svalbard and Jan Mayen", "code": "SJ" },
  { "id": "748", "name": "Swaziland", "code": "SZ" },
  { "id": "752", "name": "Sweden", "code": "SE" },
  { "id": "756", "name": "Switzerland", "code": "CH" },
  { "id": "760", "name": "Syria", "code": "SY" },
  { "id": "158", "name": "Taiwan", "code": "TW" },
  { "id": "762", "name": "Tajikistan", "code": "TJ" },
  { "id": "834", "name": "Tanzania", "code": "TZ" },
  { "id": "764", "name": "Thailand", "code": "TH" },
  { "id": "626", "name": "Timor-Leste", "code": "TL" },
  { "id": "768", "name": "Togo", "code": "TG" },
  { "id": "772", "name": "Tokelau", "code": "TK" },
  { "id": "776", "name": "Tonga", "code": "TO" },
  { "id": "780", "name": "Trinidad and Tobago", "code": "TT" },
  { "id": "788", "name": "Tunisia", "code": "TN" },
  { "id": "792", "name": "Turkey", "code": "TR" },
  { "id": "795", "name": "Turkmenistan", "code": "TM" },
  { "id": "798", "name": "Tuvalu", "code": "TV" },
  { "id": "800", "name": "Uganda", "code": "UG" },
  { "id": "804", "name": "Ukraine", "code": "UA" },
  { "id": "784", "name": "United Arab Emirates", "code": "AE" },
  { "id": "826", "name": "United Kingdom", "code": "GB" },
  { "id": "840", "name": "United States", "code": "US" },
  // { "id": "840", "name": "United States of America", "code": "US" },
  { "id": "858", "name": "Uruguay", "code": "UY" },
  { "id": "860", "name": "Uzbekistan", "code": "UZ" },
  { "id": "548", "name": "Vanuatu", "code": "VU" },
  { "id": "862", "name": "Venezuela", "code": "VE" },
  { "id": "704", "name": "Vietnam", "code": "VN" },
  { "id": "876", "name": "Wallis and Futuna", "code": "WF" },
  { "id": "887", "name": "Yemen", "code": "YE" },
  { "id": "894", "name": "Zambia", "code": "ZM" },
  { "id": "716", "name": "Zimbabwe", "code": "ZW" }
]

// Missing picture: Macedonia: https://www.4icu.org/mk/
// Page not found for Bhutan: https://www.4icu.org/bt/

// module.exports = {
//   ObjectMini : ObjectMini,
//   groupComplex : groupComplex,
//   complexName : complexName
// }
