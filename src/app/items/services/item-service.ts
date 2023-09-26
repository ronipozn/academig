import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {PublicInfo, SocialInfo, objectMini, Affiliation} from '../../shared/services/shared-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getItemByURL(url: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/' + url, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getItemByURL', null));
  }

  // async getItemAccount(mode: number, id: string): Promise<any> {
  //   const client = await this.authService.getAuth0Client();
  //   const token = await client.getTokenSilently();
  //
  //   return this.http.get('/api/itemAccount?mode=' + mode + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
  //          .toPromise().catch(this.handleError('getItemAccount', []));
  // }

  // async postItem(teaching: any, parentId: string, type: number): Promise<any> {
  //   const client = await this.authService.getAuth0Client();
  //   const token = await client.getTokenSilently();
  //
  //   return this.http.post('/api/app.json?id=' + parentId + '&type=' + type, teaching, { headers: { Authorization: `Bearer ${token}` } })
  //          .toPromise().catch(this.handleError('postTeaching', []));
  // }

  async deleteItem(mode: number, id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/item.json?mode=' + mode + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteItem', []));
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  async putSubmitTrend(trend: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/submit.json?type=0', {"trend": trend}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putSubmitTrend', []));
  }

  async putSubmitPodcast(submitPodcast: SubmitPodcast): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/submit.json?type=1', submitPodcast, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putSubmitPodcast', []));
  }

  async putSubmitEvent(submitEvent: SubmitEvent): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/submit.json?type=2', submitEvent, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putSubmitEvent', []));
  }

  async putSubmitApp(submitApp: SubmitApp): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/submit.json?type=3', submitApp, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putSubmitApp', []));
  }

  ////////////////////////////////////////
  ////////////////////////////////////////
  ////////////////////////////////////////
  ////////////////////////////////////////

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): T => {
      console.error(error); // log to console instead
      this.log(`${operation} failed: ${error.message}`);
      return (result as T);
    };
  }

  private log(message: string) { }
}

export class Item {
  constructor(
    public stage: number,
    public _id: string,
    public name: string,
    public link: string,
    public pic: string,
    public externalLink: string,
    public description: string,
    public source: string,
    public counters: number[],
    public country: number,
    public state: string,
    public city: string,
    public location: number[],
    public publicInfo: PublicInfo,
    public socialInfo: SocialInfo,
    public followStatus: boolean,
    public team: objectMini[]) {
    }
}

// export class CreateItem {
//   constructor(
//     public period: Period,
//     public id: string,
//     public name: string,
//     public pic: string,
//     public role: number,
//     public location: string,
//     public description: string,
//     public university: string,
//     public parentId: string,
//     public ai: boolean) {
//   }
// }
//
// export class UpdateItem {
//   constructor(
//     public _id: string,
//     public period: Period,
//     public id: string,
//     public name: string,
//     public pic: string,
//     public location: string,
//     public role: number,
//     public description: string,
//     public university: string) {
//   }
// }

export class itemAccount {
  constructor(
    public stage: number,
    public description: string,
    public source: string,
    public externalLink: string,
    // public rank: Rank,
    // public dates: Date[],
    // public departmentsCount: string,
    ) {
    }
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

export let PodcastType: string[] = [
  "Interview Podcast",
  "Solo Podcast",
  "Panel show",
  'Conversational or co-hosted',
  'Non-fiction storytelling',
  'Fiction storytelling',
  'Repurposed content',
  'Hybrid'
];

export let EventType: string[] = [
  "Demo Day",
  "Conference",
  "Festival",
  "Expo",
  "Competition",
  "Hackathon",
  "Networking",
  "Meetup",
  "Seminar",
  "Class"
];

export let ProductType: string[] = [
  "Subscription Product (SaaS)",
  "Software",
  'Online Course',
  'Downloadable Content (i.e. eBooks, PDF, etc)',
  'Open Source'
];

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

export class SubmitTrend {
  constructor(
    public trend: string) {
  }
}

export class SubmitPodcast {
  constructor(
    public podcastName: string,
    public podcastURL: string,
    public podcastMarkets: string[],
    public podcastType: number,
    public podcastDescription: string,
    public podcastBenefits: string,
    public podcastYear: number,
    public podcastUsers: number,

    public email: string,
    public twitter: string,
    public firstName: string,
    public lastName: string,
    public role: string,

    public goal: number,

    public referred: string,
    public comments: string) {
  }
}

export class SubmitEvent {
  constructor(
    public eventName: string,
    public eventURL: string,
    public eventMarkets: string[],
    public eventType: number,
    public eventDescription: string,
    public eventBenefits: string,
    public eventYear: number,
    public eventStartDate: Date,
    public eventEndDate: Date,

    public email: string,
    public twitter: string,
    public firstName: string,
    public lastName: string,
    public role: string,

    public goal: number,
    public goalMain: number,
    public goalType: number,
    public priceFull: number,

    public referred: string,
    public comments: string) {
  }
}

export class SubmitApp {
  constructor(
    public productName: string,
    public productURL: string,
    public productMarket: string[],
    public productType: number,
    public productDescription: string,
    public productBenefits: string,

    public companyName: number,
    public companyYear: number,
    public companyUsers: number,
    public companyRevenue: number,

    public email: string,
    public twitter: string,
    public firstName: string,
    public lastName: string,
    public role: string,

    public goal: number,
    public goalMain: number,
    public goalType: number,
    public productVersion: string,
    public priceFull: number,

    public referred: string,
    public comments: string) {
  }
}
