import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {groupComplex, objectMini} from './shared-service';

// import {PusherService} from '../../user/services/pusher.service';
// import {MessageService} from '../../user/services/message.service';
import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(
    // private pusherService: PusherService,
    // private messageService: MessageService,
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  // News[]
  async getNews(mode: number, offset: number, id: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getNews?mode=' + mode + '&offset=' + offset + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getNews', []));
  }

  // Comment[]
  async getComments(newsId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getPrivateComments?itemId=' + newsId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getNews', []));
  }

  async putNews(news: CreateNews, mode: number, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/news.json?id=' + parentId + '&mode=' + mode, news, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMeetings', []));
  }

  async postNews(news: PostNews, mode: number, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/news.json?id=' + parentId + '&mode=' + mode, news, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMeetings', []));
  }

  async deleteNews(itemId: string, mode: number, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/news.json?id=' + parentId + '&itemId=' + itemId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMeetings', []));
  }

  async putComment(news: CreateNews, itemId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/privateComment.json?itemId=' + itemId, news, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getMeetings', []));
  }

  // postComment(news: UpdateComment, commentId: string, itemId: string): Observable<string> {
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   return this.http.post<any>('/api/v1/privateComment.json?itemId=' + itemId + '&commentId=' + commentId, news, {
  //     headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
  //   }).map(response => response.data);
  // }

  // deleteComment(commentId: string, itemId: string): Observable<string> {
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   return this.http.delete<any>('/api/v1/privateComment.json?itemId=' + itemId + '&commentId=' + commentId, {
  //     headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
  //   }).map(response => response.data);
  // }

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

export class News {
  constructor(
    public id: string,
    public actor: objectMini,
    public verb: number,
    public object: objectMini,
    public target: groupComplex,
    public time: Date,
    public text: string,
    public link: string,
    public pic: string,
    public own_reactions: Reactions,
    public latest_reactions: Reactions,
    public reaction_counts: ReactionsCounts
  ) {
  }
}

export class ReactionsCounts {
  constructor(
    public claps: number,
    public comments: number) {
  }
}

export class Reactions {
  constructor(
    public claps: any[],
    public comments: any[]) {
  }
}

export class CreateNews {
  constructor(
    public actorId: string,
    public verb: number,
    public objectId: string,
    public text: string,
    public pic: string,
    public ai: boolean) {
  }
}

export class PostNews {
  constructor(
    public _id: string,
    public text: string,
    public pic: string) {
  }
}

export class Comment {
  constructor(
    public _id: string,
    public user_id: string,
    public data: Data,
    public created_at: Date,
    // public time: Date,
    public text: string,
    public pic: string,
  ) {
  }
}

export class Data {
  constructor(
    public text: string,
    public pic: string) {
  }
}

// export class CreateComment {
//   constructor(
//     public actorId: string,
//     public verb: number,
//     public objectId: string,
//     public text: string,
//     public pic: string) {
//   }
// }
//
// export class UpdateComment {
//   constructor(
//     public verb: number,
//     public objectId: string,
//     public text: string,
//     public pic: string) {
//   }
// }
