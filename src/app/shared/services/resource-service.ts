import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, groupComplex, complexName, Link} from './shared-service';
import {Channel} from '../../user/services/message.service';
import {FAQ} from './faq-service';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  // search<T>(query: string, type: string): Observable<Array<T>> {

  // async getResources<T>(mode: number, id: string, term: string = '', more: number, text: string = ''): Promise<Array<T>> {
  async getResources<T>(mode: number, id: string, term: string = '', more: number, text: string = ''): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getResources?mode=' + mode + '&id=' + id + '&term=' + term + '&more=' + more + '&text=' + text, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getResources', []));
  }

  async putCategory(title: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/resourceCategory.json?id=' + groupId, {'title': title}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putCategory', []));
  }

  async postCategory(title: string, updateIndex: number, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/resourceCategory.json?id=' + groupId + '&index=' + updateIndex, {'title': title}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postCategory', []));
  }

  async deleteCategory(index: number, itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/resourceCategory.json?id=' + groupId + '&itemId=' + itemId + '&index=' + index, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteCategory', []));
  }

  async putResource(resource: CreateResource, insertIndex: number, type: number = 0): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/resource.json?insertIndex=' + insertIndex + '&type=' + type, resource, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putResource', []));
  }

  async postResource(itemId: string, groupId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/resource.json?id=' + groupId + '&itemId=' + itemId + '&mode=' + mode, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postResource', []));
  }

  async deleteResource(itemId: string, category: number, parentId: string, type: number = 0): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/resource.json?id=' + parentId + '&itemId=' + itemId + '&category=' + category + '&type=' + type, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteResource', []));
  }

  // ResourceDetails
  async getResourceDetails(resourceId: string, parentId: string = null): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/resource/' + resourceId + '.json?parentId=' + parentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getResourceDetails', null));
  }

  //////////////////////////////////////////
  ////////////////// Price /////////////////
  //////////////////////////////////////////

  async postPrice(resourceId: string, priceObj: Price): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/price.json?id=' + resourceId, priceObj, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postPrice', []));
  }

  //////////////////////////////////////////
  /////////////// Stripe Buy //////////////
  //////////////////////////////////////////

  async postStripeService(id: string, itemId: string, userId: string, buildStatus: number, filterStatus: number, standout: number): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.post('/api/stripeService.json?build=' + buildStatus + '&standout=' + standout + '&id=' + id + '&itemId=' + itemId + '&userId=' + userId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postStripeService', []));
  }

  //////////////////////////////////////////
  ///////////////// Request ////////////////
  //////////////////////////////////////////

  async postRequest(resourceId: string, message: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/request.json?id=' + resourceId, {"message": message}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postRequest', []));
  }

  //////////////////////////////////////////
  ////////////////// Terms /////////////////
  //////////////////////////////////////////

  async postTerms(mode: number, more: string, projId: string): Promise<any> {
    const terms = {'mode': mode, 'more': more};

    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/terms.json?id=' + projId, terms, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postTerms', []));
  }

  async deleteTerms(projId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/terms.json?id=' + projId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTerms', []));
  }

  //////////////////////////////////////////
  ///////////////// Tables /////////////////
  //////////////////////////////////////////

  async table(mode: number, type: number, resourceId: string,
        manual: Core,
        code: Code,
        cad: Core,
        inventory: Inventory,
        equipment: Equipment): Promise<any> {

    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    let data: any;

    switch (mode) {
       case 0: data = manual; break;
       case 1: data = code; break;
       case 2: data = cad; break;
       case 3: data = inventory; break;
       case 4: data = equipment; break;
    }

    if (type == 0) {
      return this.http.put('/api/resourceTable.json?mode=' + mode + '&id=' + resourceId, data, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('putResourceTable', []));
    } else {
      return this.http.post('/api/resourceTable.json?mode=' + mode + '&id=' + resourceId, data, { headers: { Authorization: `Bearer ${token}` } })
             .toPromise().catch(this.handleError('postResourceTable', []));
    }
  }

  async deleteTable(mode: number, resourceId: string, itemId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/resourceTable.json?mode=' + mode + '&id=' + resourceId + '&itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteResourceTable', []));
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

export let ServicePriceType: string[] = [
  'Per project',
  'Per hour',
  'Per item'
];

export let ServicePriceMode: string[] = [
  'Public',
  'By request'
];

export let serviceSelect = [
                            {display: 'Analysis Service', value: 10},
                            {display: 'Mathematical Models', value: 20},
                            {display: 'Forecasting and Prediction', value: 30},
                            {display: 'Biostatistics', value: 40},
                            {display: 'Clinical Trials', value: 50},
                            {display: 'Scientific Consulting', value: 60},
                            {display: 'Medical Devices', value: 70},
                            {display: 'Clinical Research Development', value: 80},
                            {display: 'Food Science', value: 90},
                            {display: 'Food Technology', value: 100},
                            {display: 'Scientific Law', value: 110},
                            {display: 'Biotechnology', value: 120},
                            {display: 'Robotics', value: 130},
                            {display: 'Artificial Intelligence', value: 140},
                            {display: 'Synthesis Service', value: 150},
                            {display: 'Measurements Service', value: 160},
                            {display: 'Lab Equipment', value: 170},
                            {display: 'Calibration Service', value: 180},
                            {display: 'Lab Supply', value: 190},
                            {display: 'Software', value: 200},
                            {display: 'Simulation', value: 210},
                            {display: 'Prototyping', value: 220},
                            {display: 'Business Service', value: 230},
                            {display: 'Management Service', value: 240},
                            {display: 'Labeling Service', value: 250},
                            {display: 'Training Service', value: 260},
                            {display: 'Scientific Writing', value: 270},
                            {display: 'Visual Communication', value: 280},
                            {display: 'Scientific Editing', value: 290},
                            {display: 'Facilities', value: 300}
                           ];

export let serviceTypes = {
                            10: 'Analysis Service',
                            20: 'Mathematical Models',
                            30: 'Forecasting and Prediction',
                            40: 'Biostatistics',
                            50: 'Clinical Trials',
                            60: 'Scientific Consulting',
                            70: 'Medical Devices',
                            80: 'Clinical Research Development',
                            90: 'Food Science',
                            100: 'Food Technology',
                            110: 'Scientific Law',
                            120: 'Biotechnology',
                            130: 'Robotics',
                            140: 'Artificial Intelligence',
                            150: 'Synthesis Service',
                            160: 'Measurements Service',
                            170: 'Lab Equipment',
                            180: 'Calibration Service',
                            190: 'Lab Supply',
                            200: 'Software',
                            210: 'Simulation',
                            220: 'Prototyping',
                            230: 'Business Service',
                            240: 'Management Service',
                            250: 'Labeling Service',
                            260: 'Training Service',
                            270: 'Scientific Writing',
                            280: 'Visual Communication',
                            290: 'Scientific Editing',
                            300: 'Facilities'
                          };

export class Core {
  constructor(
    public _id: string,
    public name: string,
    public version: string,
    public date: Date,
    public description: string,
    public files: string) {
    }
}

export class Code extends Core {
  constructor(
    public _id: string,
    public name: string,
    public version: string,
    public date: Date,
    public description: string,
    public git: string,
    public files: string) {
      super(_id, name, version, date, description, files);
    }
}

export class Inventory {
  constructor(
    public _id: string,
    public pic: string,
    public name: string,
    public description: string,
    public vendor: string,
    public model: string,
    public price: string,
    public quantity: string,
    public link: string,
    public files: string) {
    }
}

export class Equipment {
  constructor(
    public _id: string,
    public pic: string,
    public name: string,
    public description: string,
    public manufacturer: string,
    public model: string,
    public link: string,
    public price: string,
    public files: string) {
    }
}

export class CreateResource {
  constructor(
    public name: string,
    public pic: string,
    public description: string,
    public categoryId: number,
    public price: Price,

    public groupId: string,

    public standout: number,
    public feedback: number,

    public how: number,
    public direct: string,

    public people: objectMini[],
    public projects: objectMini[],
    public tags: string[],
    public ai: boolean
  ) {
  }
}

export class Resource {
  constructor(
    public _id: string,
    public mode: number, // 0 - On Hold
                         // 1 - Active
                         // 2 - Canceled
    public standout: number, // [0-3]
    public payment: boolean,

    public group: groupComplex,
    public profile: objectMini,
    public name: string,
    public pic: string,
    public description: string,
    public categoryId: number,
    public price: Price,
    public tags: string[],
    public views: number[],
    public channels: Channel[],
    public followStatus: boolean) {
  }
}

export class ResourceDetails {
  constructor(
    public _id: string,
    public mode: number, // 0 - On Hold
                         // 1 - Active
                         // 2 - Canceled
    public how: number, // 0 - Academig apply
                        // 1 - External email
                        // 2 - External website
    public direct: string, // how link
    public standout: number, // [0-3]
    public group: groupComplex,
    public profile: objectMini,
    public requests: Request[],

    public name: string,
    public pic: string,
    public categoryId: string,
    public price: Price,

    public created_on: Date,
    public views: number[],
    public downloads: number[],
    public followStatus: boolean,

    public people: objectMini[],
    public projects: objectMini[],
    public tags: string[],

    public background: string,
    public backgroundPic: string,
    public backgroundCaption: string,

    public description: string,
    public descriptionPic: string,
    public descriptionCaption: string,

    public termsMode: number,
    public termsMore: string,
    public publicationsIds: number[],
    public gallery: objectMini[],
    public links: Link[],
    public faqs: FAQ[],
    public manuals: Core[],
    public codes: Code[],
    public cads: Core[],
    public inventories: Inventory[],
    public equipments: Equipment[]) {
  }
}

export class Category {
  constructor(
    public _id: string,
    public title: string,
    public countIds: number) {
  }
}

export class Price {
  constructor(
    public request: boolean,
    public type: boolean,
    public range: boolean,
    public price: number[],
    public mode: number,
    public currency: number,
    public internalId: string
  ) {
  }
}

export class Request {
  constructor(
    public channelId: string,
    public date: Date,
    public userId: string,
  ) {
  }
}

export let featuresStandard: string[] = [
  '1x service alert sent to subscribers in your field',
  '1x social media post',
  'Highlight your service posting in search results',
  'Share in Academig Slack channel',
  'Bi-weekly detailed ad-performance report email',
  'Appear at top of search results for 4 weeks',
  'Featured newsletter placement'
];

export let featuresGood: string[] = [ // Standard €490 per service ad
  '2x service alert email sent to subscribers in your field',
  '2x social media posts',
  'Highlight your service posting in search results',
  'Share in Academig Slack channel',
  'Bi-weekly detailed ad-performance report email',
  'Appear at top of search results for 4 weeks',
  'Featured newsletter placement'
];

export let featuresBest: string[] = [ // Social campaign €2,490 per campaign
  '2x service alert email sent to subscribers in your field', // Advanced targeting by interest, location, and language​
  '8x social media posts', // Reach an additional 40,000-100,000 potential candidates on social media​
  'Highlight your service posting in search results',
  'Share in Academig Slack channel',
  'Bi-weekly detailed ad-performance report email',
  'Appear at top of search results for 4 weeks',
  'Featured newsletter placement'
];
