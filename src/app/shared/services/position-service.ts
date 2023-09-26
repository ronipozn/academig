import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {groupComplex, complexName, objectMini, Period, Affiliation} from './shared-service';
import {CreateGroup} from './group-service';

// Status:

// 0 - regular
// 1 - watching (following)

// 9 - applied filter
// 10 - applied waiting

// 11 - applied filter - best
// 12 - applied filter - normal
// 13 - applied filter - ignore

// 20 - online interview (choose dates)
// 21 - online interview
// 22 - online accepted (waiting for answer)

// 30 - in-person interview (choose dates)
// 31 - in-person interview
// 32 - in-person accepted (waiting for answer)

// 40 - user accept

// 50 - hire

// 100+ - withdraw

// Stage:
// 1 - shortlisted (waiting for answer)
// 2 - waitlist
// 3 - archived

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OpenPositionService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}


  async positionPreview(universityId: string, departmentId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/openPositionPreview?universityId=' + universityId + '&departmentId=' + departmentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('positionPreview', []));
  }

/////////////////////////////
/////////////////////////////
/////////////////////////////
/////////////////////////////

  async getPositions(mode: number, id: string, type: number = 0, text: string = ''): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getOpenPositions?mode=' + mode + '&id=' + id + '&type=' + type + '&text=' + text, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPositions', []));
  }

  async putPositionLab(group: CreateGroup, position: CreateOpenPosition): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.put('/api/openPosition-create.json', {'group': group, 'position': position}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPositionLab', []));
  }

  async putPosition(position: CreateOpenPosition, groupId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.put('/api/openPosition.json?id=' + groupId, position, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPosition', []));
  }

  async postPosition(itemId: string, groupId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/openPosition.json?id=' + groupId + '&itemId=' + itemId + '&mode=' + mode, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postPosition', []));
  }

  async updateGeneral(itemId: string, groupId: string, type: number, site: string, spotsAvailable: number, contractLength: number,
                      contractLengthType: number, salary: number, salaryCurrency: number, internalId: string): Promise<any> {

    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    const general = {type: type, site: site, spotsAvailable: spotsAvailable, contractLength: contractLength, contractLengthType: contractLengthType, internalId: internalId, salary: salary, salaryCurrency: salaryCurrency };

    return this.http.post('/api/openPositionGeneral.json?id=' + groupId + '&itemId=' + itemId, general, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('updateGeneral', []));
  }

  async updateLetters(itemId: string, groupId: string, lettersGuidelines: string, lettersRequired: boolean[], gradesRequired: boolean[], numReferees: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    const letters = {lettersGuidelines: lettersGuidelines, lettersRequired: lettersRequired, gradesRequired: gradesRequired, numReferees: numReferees };

    return this.http.post('/api/openPositionLetters.json?id=' + groupId + '&itemId=' + itemId, letters, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('updateLetters', []));
  }

  async updateDeadlines(itemId: string, groupId: string, stepsDates: Date[], stepsEnables: number[]): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    const steps = {'stepsDates': stepsDates, 'stepsEnables': stepsEnables};

    return this.http.post('/api/openPositionDeadlines.json?id=' + groupId + '&itemId=' + itemId, steps, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('updateDeadlines', []));
  }

  async deletePosition(itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/openPosition.json?id=' + groupId + '&itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deletePosition', []));
  }

  async getPositionDetails(positionId: string, parentId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/position/' + positionId + '.json?parentId=' + parentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPositionDetails', null));
  }

  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////

  async postStripePosition(id: string, itemId: string, userId: string, buildStatus: number, filterStatus: number, standout: number): Promise<any> {
    // console.log('postStripePosition',id,itemId,userId)

    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.post('/api/stripePosition.json?build=' + buildStatus + '&filter=' + filterStatus + '&standout=' + standout + '&id=' + id + '&itemId=' + itemId + '&userId=' + userId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postStripeSubscribe', []));
  }

  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////

  async putApply(itemId: string, mode: number, apply: OpenPositionApply): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/apply.json?id=' + itemId + '&mode=' + mode, apply, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putApply', []));
  }

  async postApply(itemId: string, mode: number, apply: OpenPositionApply): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/apply.json?id=' + itemId + '&mode=' + mode, apply, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postApply', []));
  }


  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////

  async getPositionStats(positionId: string, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/position/' + positionId + '.json' + '/stats?parentId=' + parentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPositionStats', null));
  }


  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////

  async getPositionCandidates(positionId: string, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/position/' + positionId + '.json' + '/proposals?parentId=' + parentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPositionCandidates', null));
  }

  async postCandidateStage(itemId: string, peopleId: string, stage: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/candidateStage.json?id=' + itemId + '&peopleId=' + peopleId + '&stage=' + stage, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postCandidateStage', []));
  }

  async postCandidateNote(itemId: string, peopleId: string, note: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/candidateNote.json?id=' + itemId + '&peopleId=' + peopleId, {"note": note}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postCandidateStage', []));
  }

  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): T => {
      console.error(error); // log to console instead
      this.log(`${operation} failed: ${error.message}`);
      return (result as T);
    };
  }

  private log(message: string) { }
}

class projectMini extends objectMini {
  constructor(
    public id: string,
    public name: string,
    public pic: string,
    public spotsAvailable: number
  ) {
    super(id, name, pic);
  }
}

export class CreateOpenPosition {
  constructor(
    public ai: boolean,
    public groupId: string,

    public standout: number,
    public filter: boolean,
    public feedback: number,

    public title: string,
    public position: number,
    public type: number,

    public how: number,
    public direct: string,

    public contractLength: string,
    public contractLengthType: number,
    public spotsAvailable: number,
    public internalId: string,
    // public salary: number,
    // public hours: string,
    public tags: string[],
    public projects: projectMini[],

    public gradesRequired: boolean[],
    public lettersRequired: boolean[],
    public numReferees: number,
    public lettersGuidelines: string,

    public stepsDates: Date[],
    public stepsEnables: number[],

    public description: string,
    public scholarship: string,
    public duties: string,
    public expectations: string,
    public requiredEducation: string,
    public requiredExperience: string
 ) {}
}

export class OpenPositionApply {
  constructor(
    public grades: string[],
    public letters: string[],
    public referees: Referee[]) {
    }
}

export class OpenPositionApplyInfo extends OpenPositionApply {
  constructor(
    public id: string,
    public filter: string, // filterNote
    public filterStatus: number,
    public note: string,
    public status: number,
    public date: Date[],
    public grades: string[],
    public letters: string[],
    public referees: Referee[]
  ) {
    super(grades, letters, referees);
  }
}

export class OpenPositionCandidateInfo extends OpenPositionApply {
  constructor(
    public profile: objectMini,
    public stage: number,
    public status: number,
    public date: Date[],
    public note: string,
    public grades: string[],
    public letters: string[],
    public referees: Referee[]
  ) {
    super(grades, letters, referees);
  }
}
//     public statusText: string,

export class Referee {
  constructor(
    // public member: objectMini,
    public member: string,
    // public type: number,
    // public status: number,
    public email: string,
    public description: string
  ) {}
}

export class OpenPosition {
  constructor(
    public _id: string,
    public mode: number, // 0 - On Hold
                         // 1 - Active
                         // 2 - Canceled
    public standout: number,
    public payment: boolean,

    public group: groupComplex,

    public position: number,
    public title: string,
    public type: number,

    public site: string,

    public created_on: string,
    public views: number[],

    public internalId: string,
    public description: string,
    public spotsAvailable: number,
    public contractLength: string,
    public contractLengthType: number,

    public deadline: Date,
    public startDate: Date,
    public note: string,

    public stepsDates: Date[],
    public stepsEnables: number[],
    public activeStep: number,

    public apply: OpenPositionApplyInfo[], // dynamic
    public stats: number[][][],
  ) {}
}

export class OpenPositionDetails {
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
    // public status: number,
    public filter: boolean,

    public group: groupComplex,
    public affiliations: Affiliation[],

    public position: number,
    public title: string,
    public type: number,

    public site: string,

    public created_on: string,
    public views: number[],
    // public style: boolean,

    public spotsAvailable: number,
    public contractLength: number,
    public contractLengthType: number,
    public internalId: string,
    public salary: number,
    public salaryCurrency: number,
    // public hours: string,

    public country: number,
    public state: string,
    public city: string,
    public location: string[],

    public tags: string[],
    public projects: projectMini[],

    public lettersGuidelines: string,
    public lettersRequired: boolean[],
    public gradesRequired: boolean[],
    public numReferees: number,

    public stepsDates: Date[],
    public stepsEnables: number[],

    public apply: OpenPositionApplyInfo[], // dynamic

    public description: string,
    public scholarship: string,
    public duties: string,
    public expectations: string,
    public requiredEducation: string,
    public requiredExperience: string,
  ) {}
}

export let featuresStandard: string[] = [
  '1x job alert sent to subscribers in your field',
  '1x social media post',
  'Highlight your job posting in search results',
  'Share in Academig Slack channel',
  'Bi-weekly detailed ad-performance report email',
  'Displaying your lab logo',
  'Appear at top of search results for 4 weeks',
  'Featured newsletter placement'
];

export let featuresGood: string[] = [ // Standard €490 per job ad
  '2x job alert email sent to subscribers in your field',
  '2x social media posts',
  'Highlight your job posting in search results',
  'Share in Academig Slack channel',
  'Bi-weekly detailed ad-performance report email',
  'Displaying your lab logo',
  'Appear at top of search results for 4 weeks',
  'Featured newsletter placement'
];

export let featuresBetter: string[] = [ // High visibility €690 per job ad
  '2x job alert email sent to subscribers in your field',
  '4x social media posts',
  'Highlight your job posting in search results',
  'Share in Academig Slack channel',
  'Bi-weekly detailed ad-performance report email',
  'Displaying your lab logo',
  'Appear at top of search results for 4 weeks',
  'Featured newsletter placement'
];

export let featuresBest: string[] = [ // Social campaign €2,490 per campaign
  '2x job alert email sent to subscribers in your field',
  '8x social media posts', // Reach an additional 40,000-100,000 potential candidates on social media​
  'Highlight your job posting in search results',
  'Share in Academig Slack channel',
  'Bi-weekly detailed ad-performance report email',
  'Displaying your lab logo',
  'Appear at top of search results for 4 weeks',
  'Featured newsletter placement'
  // Advanced targeting by interest, location, and language​
];
