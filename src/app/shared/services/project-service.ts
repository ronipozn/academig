import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMini, Period, complexName, groupComplex} from './shared-service';
import {FAQ} from './faq-service';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  // MODE:
  // 0 - user following
  // 1 - user profile
  // 2 - group - current/past

  // mini=1 ==> should return ObjectMini and not Project

  async getProjects(mode: number, id: string, type: number = 0, mini: number = 0, text: string = ''): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getProjects?mode=' + mode + '&id=' + id + '&type=' + type + '&mini=' + mini + '&text=' + text, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getProjects', []));
  }

  async putProject(project: CreateProject, type: number, topicId: string = ''): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/project.json?type=' + type + '&topicId=' + topicId, project, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putProject', []));
  }

  async postProject(project: UpdateProject, parentId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/project.json?id=' + parentId + '&type=' + type, project, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postProject', []));
  }

  async deleteProject(itemId: string, parentId: string, type: number, topicId: string = ''): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/project.json?id=' + parentId + '&itemId=' + itemId + '&type=' + type + '&topicId=' + topicId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteProject', []));
  }

  async moveProject(itemId: string, topicId: string, parentId: string, type: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/projectMove.json?id=' + parentId + '&itemId=' + itemId + '&type=' + type + '&topicId=' + topicId, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('moveProject', []));
  }

  async getProjectDetails(projectId: string, parentId: string = null): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/project/' + projectId + '.json?parentId=' + parentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getProjectDetails', null));
  }

  async pushResource(projectId: string, resourceId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/projectResource.json?id=' + projectId, {'resourceId': resourceId}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('pushResource', []));
  }

  async pullResource(projectId: string, resourceId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/projectResource.json?id=' + projectId + '&resourceId=' + resourceId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('pullResource', []));
  }

  //////////////////////////////////////////
  ////////////////// Topic /////////////////
  //////////////////////////////////////////

  // Topic[]
  async getTopics(mode: number, id: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/getTopics?mode=' + mode + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getTopics', []));
  }

  // TopicDetails
  async getTopicDetails(topic: string, groupId: string = null): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/topic/' + topic + '?id=' + groupId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getTopics', null));
  }

  async putTopic(name: string, ai: boolean, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/topic.json?id=' + groupId, {name: name, ai: ai}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putTopic', []));
  }

  async postTopic(name: string, itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/topic.json?itemId=' + itemId + '&id=' + groupId, {name: name}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postTopic', []));
  }

  async deleteTopic(itemId: string, groupId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/topic.json?id=' + groupId + '&itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteTopic', []));
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

export class Topic {
  constructor(
    public _id: string,
    public name: string,
    public count: number,
    public ai: boolean) {
  }
}

export class TopicDetails {
  constructor(
    public _id: string,
    public name: string,
    public background: TextPic,
    public layMan: TextPic) {
    }
}

export class TextPic {
  constructor(
    public text: string,
    public pic: string,
    public caption: string) {
    }
}


export class CreateProject {
  constructor(
    public name: string,
    public pic: string,
    public period: Period,
    public description: string,
    public groupId: string,
    public collaborations: groupComplex[],
    public people: objectMini[],
    public fundings: objectMini[],
    public ai: boolean) {
  }
}

export class UpdateProject {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public period: Period,
    public description: string) {
  }
}

export class Project {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public description: string,
    public period: Period,
    public group: groupComplex,
    public profile: objectMini,
    public views: number[],
    public followStatus: boolean) {
  }
}

export class ProjectDetails {
  constructor(
    public _id: string,
    public name: string,
    public pic: string,
    public description: string,

    public group: groupComplex,
    public profile: objectMini,

    public period: Period,
    public views: number[],
    public followStatus: boolean,

    public background: string,
    public backgroundPic: string,
    public backgroundCaption: string,

    public goals: string,
    public faqs: FAQ[],
    public collaborations: objectMini[],
    public people: objectMini[],
    public fundings: objectMini[],
    public showcases: objectMini[]) {
  }
}
