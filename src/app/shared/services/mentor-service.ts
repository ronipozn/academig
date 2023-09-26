import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, groupComplex, complexName} from './shared-service';
import {Channel} from '../../user/services/message.service';
import {FAQ} from './faq-service';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

@Injectable({
  providedIn: 'root'
})
export class MentorService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async getMentor(id: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getResources?id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMentor', []));
  }

  async getMentorDetails(mentorId: string = null): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/mentor/' + mentorId + '.json', { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMentorDetails', null));
  }

  async putMentor(): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/mentor.json', null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putMentor', []));
  }

  async postMentor(mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/mentor.json?mode=' + mode, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postMentor', []));
  }

  async deleteMentor(mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/mentor.json?mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteMentor', []));
  }

  //////////////////////////////////////////
  //////////////// Expertise ///////////////
  //////////////////////////////////////////

  async putExpertise(expertise: Expertise, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/expertise.json?type=' + type, expertise, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putExpertise', []));
  }

  async postExpertise(expertise: Expertise, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/expertise.json?type=' + type, expertise, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postExpertise', []));
  }

  async deleteExpertise(id: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/expertise.json?type=' + type + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteExpertise', []));
  }

  //////////////////////////////////////////
  //////////// Mentoring Details ///////////
  //////////////////////////////////////////

  async postAvailability(availabilityeObj: Availability): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/mentor_availability.json', availabilityeObj, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postAvailability', []));
  }

  async postOngoing(ongoingObj: OnGoing): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/mentor_ongoing.json', ongoingObj, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postOngoing', []));
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
  ////////////////// Submit ////////////////
  //////////////////////////////////////////

  async putSubmitMentor(submitMentor: SubmitMentor): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/submit.json?type=4', submitMentor, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putSubmitMentor', []));
  }

  //////////////////////////////////////////
  ////////////////// Status ////////////////
  //////////////////////////////////////////

  async postStatus(mentorId: string, status: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/mentorStatus.json?status=' + status + '&id=' + mentorId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postStatus', []));
  }

  async postEmail(mentorId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/mentorEmail.json?type=' + type + '&id=' + mentorId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postEmail', []));
  }

  //////////////////////////////////////////
  //////////////////////////////////////////
  //////////////////////////////////////////

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

export class SubmitMentor {
  constructor(
    public first_name: string,
    public last_name: string,
    public linkedin: string,
    public position: string,
    public experience: string,
    public charging: string,
    public charing_importance: string,
    public pitch: string,
    public price_hour: string,
    public charging_terms: string,
    public background_terms: string,

    public academic_writing: number,

    public hours: string,
    public past_mentoring: string,
    public communication_tool: string,
    public description: string,
    public mindset: string,
    public desired_topic: string,
    public out_of_the_box: string,
    public content: string,
    public feedback: string,
  ) {
  }
}

export class Mentor {
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
    public availability: Availability,
    public tags: string[],
    public views: number[],
    public channels: Channel[],
    public followStatus: boolean) {
  }
}

export class Expertise {
  constructor(
    public _id: string,
    public name: string,
    public years: string,
    public description: string) {
    }
}

export class Availability {
  constructor(
    public price: number,
    public times: number[],
    public durations: number[],
    public days: number[],
    public availability: number[],
    public tools: number[]) {
  }
}

export class OnGoing {
  constructor(
    public price: number,
    public hours: number,
    public details: string) {
  }
}

export class Request {
  constructor(
    public channelId: string,
    public date: Date,
    public userId: string) {
  }
}

// <!-- free, <25$, 25-50, 50-100, 100+ -->
export let PricesSelect = [
  {value: 0, viewValue: 'Free'},
  {value: 1, viewValue: '10$ per hour'},
  {value: 2, viewValue: '25$ per hour'},
  {value: 3, viewValue: '50$ per hour'},
  {value: 4, viewValue: '75$ per hour'},
  {value: 5, viewValue: '100$ per hour'},
  {value: 6, viewValue: '150$ per hour'},
  {value: 7, viewValue: '200$ per hour'},
];

export let DurationsSelect = [
  {value: 0, viewValue: '15 min'},
  {value: 1, viewValue: '30 min'},
  {value: 2, viewValue: '60 min'},
];

export let TimesSelect = [
  {value: 0, viewValue: '00:00-06:00'},
  {value: 1, viewValue: '06:00-12:00'},
  {value: 2, viewValue: '12:00-18:00'},
  {value: 3, viewValue: '18:00-24:00'},
];

export let DaysSelect = [
  {value: 0, viewValue: 'Sunday'},
  {value: 1, viewValue: 'Monday'},
  {value: 2, viewValue: 'Tuesday'},
  {value: 3, viewValue: 'Wedensday'},
  {value: 4, viewValue: 'Thuresday'},
  {value: 5, viewValue: 'Friday'},
];

export let AvailabilitySelect = [
  {value: 0, viewValue: 'Audio'},
  {value: 1, viewValue: 'Video'},
];

export let ToolsSelect = [
  {value: 0, viewValue: 'Skype'},
  {value: 1, viewValue: 'Zoom'},
  {value: 2, viewValue: 'Goggle Hangout'},
  {value: 3, viewValue: 'Other'},
];

export let ExpertisesSelect = [
  // {value: 0, display: 'Mindset Coaching'},
  {value: 0, viewValue: 'Mindset Coaching'},
  {value: 1, viewValue: 'Advice on Grants'},
  {value: 2, viewValue: 'Advice on Career Path / Career Planning'},
  {value: 3, viewValue: 'Work-Life Balance'},
  {value: 4, viewValue: 'Advice on Presenting'},
  {value: 5, viewValue: 'Advice on Writing'},
  {value: 6, viewValue: 'Social Media / Web Visibility'},
  {value: 7, viewValue: 'Technology and Tools'},
  {value: 8, viewValue: 'Communication'},
  {value: 9, viewValue: 'Women in STEM'},
  {value: 10, viewValue: 'Women in Academia'},
];
