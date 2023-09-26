import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {objectMiniType, objectMini, objectMiniEmail, groupComplex} from './shared-service';

import * as moment from 'moment';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

// 0 Papers
// 1 Books
// 2 Books Chapters
// 3 Conferences
// 4 Patents
// 5 Reports

@Injectable({
  providedIn: 'root'
})
export class PublicationService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  // 0 - user following
  // 1 - user profile
  // 2 - group

  // Publication[]
  async getPublications(mode: number, id: string, more: number, text: string = ''): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getPublications?mode=' + mode + '&id=' + id + '&more=' + more + '&text=' + text, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPublications', []));
  }

  async queryJournals(term: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    var termReg = term.replace(/[^\w\s]/gi, '');

    return this.http.get('/api/queryJournals?term=' + termReg, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('queryJournals', []));
  }

  async queryPublications(term: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    var termReg = term.replace(/[^\w\s]/gi, '');
    var rows = 100;

    return this.http.get('/api/queryPublications?term=' + termReg + '&rows=' + rows, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('queryPublications', []));
  }

  async generateSuggestions(id: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/suggestionsPublications?id=' + id + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('generateSuggestions', []));
  }

  async decisionSuggestion(id: string, itemId: string, action: number, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/suggestionPublication?id=' + id + '&itemId=' + itemId + '&action=' + action + '&mode=' + mode, null, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('decisionSuggestion', []));
  }

  async putPublication(publication: CreatePublication, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/publication.json?mode=' + mode, publication, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putPublication', []));
  }

  async deletePublications(itemsIds: string[], id: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/publications.json?id=' + id + '&mode=' + mode, itemsIds, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deletePublications', []));
  }

  // PublicationDetails
  async getPublicationDetails(publicationId: string, parentId: string = null): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/publication/' + publicationId + '.json?parentId=' + parentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getPublicationDetails', null));
  }

  async updatePublicationField(type: number, mode: number, itemId: string, parentId: string, data): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/publicationField.json?type=' + type + '&mode=' + mode + '&itemId=' + itemId + '&id=' + parentId, (type == 8) ? data : {'text': data}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('updatePublicationField', []));
  }

  async deletePublicationField(type: number, mode: number, itemId: string, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/publicationField.json?type=' + type + '&mode=' + mode + '&itemId=' + itemId + '&id=' + parentId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deletePublicationField', []));
  }

  async updatePublicationJournal(mode: number, itemId: string, parentId: string, obj: JournalObj): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/journal.json?itemId=' + itemId + '&id=' + parentId + '&mode=' + mode, obj, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('updatePublicationJournal', []));
  }

  async deletePublicationJournal(mode: number, itemId: string, parentId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/journal.json?itemId=' + itemId + '&id=' + parentId + '&mode=' + mode, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deletePublicationJournal', []));
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

  private log(message: string) {
    // this.messageService.add(`HeroService: ${message}`);
  }

}

@Injectable()
export class SortService {

  arraySort(array: Array<Publication>, sortVar: string, asc: number): void {
    const x1 = asc ? 1 : -1
    const x2 = asc ? -1 : 1
    // Object.keys(title).map(key => console.log(key));
    array.sort((a: Publication, b: Publication) => {
      // console.log(a[sortVar],b[sortVar])
      if (a[sortVar] < b[sortVar]) {
        return x1;
      } else if (a[sortVar] > b[sortVar]) {
        return x2;
      } else {
        return 0;
      }
    });
  }

  // Cannot read property 'date' of undefined at publication-service.ts:188 at Array.filter (<anonymous>) at SortService.yearsFilter (publication-service.ts:188) at PublicationsListTableComponent.onSortFunc (publications-list-table.ts:202) at PublicationsListTableComponent.set publicationToggle [as publicationToggle] (publications-list-table.ts:32)
  yearsFilter(array: Array<Publication>, sinceYear: number): Array<Publication> {
    return(array.filter(r => moment(r.date).year() >= sinceYear));
  }

  yearsRangeFilter(array: Array<Publication>, sinceYear: number, toYear: number): Array<Publication> {
    return(array.filter(r => (moment(r.date).year() >= sinceYear && moment(r.date).year() <= toYear)));
  }

  authorSort(array: Array<Publication>, authorFirst: boolean, asc: number): void {
    const x1 = asc ? 1 : -1
    const x2 = asc ? -1 : 1
    let x: string
    let y: string
    array.sort((a: Publication, b: Publication) => {
      x = authorFirst ? a.authors[0].name : a.authors[a.authors.length - 1].name;
      y = authorFirst ? b.authors[0].name : b.authors[b.authors.length - 1].name;
      if (x < y) {
        return x1;
      } else if (x > y) {
        return x2;
      } else {
        return 0;
      }
    });
  }

  folderSort(array: Array<Publication>, sortVar: string, asc: number): void {
    const x1 = asc ? 1 : -1
    const x2 = asc ? -1 : 1
    // Object.keys(title).map(key => console.log(key));
    array.sort((a: Publication, b: Publication) => {
      let aFolder: Folder;
      let bFolder: Folder;
      if (sortVar) {
        aFolder = a.folders ? a.folders.reverse().find(r => r.folder==sortVar) : null;
        bFolder = b.folders ? b.folders.reverse().find(r => r.folder==sortVar) : null;
      } else {
        aFolder = a.folders ? a.folders.reverse().find(r => r.folder!=sortVar) : null;
        bFolder = b.folders ? b.folders.reverse().find(r => r.folder!=sortVar) : null;
      }
      const aDate = aFolder ? aFolder.date : -1;
      const bDate = bFolder ? bFolder.date : -1;
      if (aDate < bDate) {
        return x1;
      } else if (aDate > bDate) {
        return x2;
      } else {
        return 0;
      }
    });
  }
}

export class CreatePublication {
  constructor(
    public type: number,
    public title: string,
    public folders: string[],
    public parentId: string,

    public date: Date,
    public authors: objectMini[],
    public publisher: string,
    public abstract: string,
    public abstractPic: string,
    public url: string,
    public tags: string[],
    public doi: string,
    public projects: objectMini[],
    public fundings: objectMini[],
    public pdf: string,
    public pdfMode: number,
    public referencesCount: number,
    public citationsCount: number,
    public journal: Journal, // Paper, Report, Conference(conference)
    public abbr: string, // Paper, Report
    public volume: number, // Paper, Chapter(chapter), Patent(patentNumber), Report(reportNumber)
    public issue: number, // Paper
    public pages: string, // Paper, Chapter, Conference, Book(length), Patent(applicationNumber)
    public edition: string, // Book, Chapter
    public ai: boolean
  ) {}
}

export class Publication {
  constructor(
    public _id: string,
    public type: number,
    public title: string,
    public views: number[],
    public folders: Folder[],
    public userFolders: Folder[],
    public citations: number,
    public date: Date,
    public authors: objectMini[],
    public abstract: string,
    public abstractPic: string,
    public doi: string,
    public pdf: string,
    public citationsCount: number,
    public tags: string[],

    public journal: Journal, // Paper, Report, Conference(conference)
    public volume: number, // Paper, Chapter(chapter), Patent(patentNumber), Report(reportNumber)
    public issue: number, // Paper
    public edition: string, // Book, Chapter
    public pages: string // Paper, Chapter, Conference, Book(length), Patent(applicationNumber)
  ) {}
}

export class PublicationDetails {
  constructor(
    public _id: string,
    public type: number,
    public title: string,
    public views: number[],
    public folders: Folder[],
    public citations: number,
    public date: Date,
    public authors: objectMini[],
    public publisher: string,
    public abstract: string,
    public abstractPic: string,
    public url: string,
    public tags: string[],
    public figures: objectMiniType[],
    public doi: string,
    public fundings: objectMini[],
    public pdf: string,

    public journal: Journal, // Paper, Report, Conference(conference)
    public abbr: string, // Paper, Report
    public volume: number, // Paper, Chapter(chapter), Patent(patentNumber), Report(reportNumber)
    public issue: number, // Paper
    public pages: string, // Paper, Chapter, Conference, Book(length), Patent(applicationNumber)
    public edition: string, // Book, Chapter

    // public groups: groupComplex[],
    // public resources: objectMini[],
    // public projects: objectMini[]
  ) {}
}

export class Folder {
  constructor(
    public _id: string,
    public folder: string,
    public date: Date,
    public end: Date,
    public summary: string,
    public privacy: string,
    public rating: number,
    public recommend: objectMiniEmail,
    public recommended: objectMiniEmail,
    public feed: boolean,
    public count: number) {
    }
}

export class ToggleFolder {
  constructor(
    public _id: string,
    public checked: boolean,
    public folder: string,
    public date: Date,
    public end: Date,
    public summary: string,
    public privacy: string,
    public rating: number,
    public recommend: objectMiniEmail,
    public recommended: objectMiniEmail,
    public feed: boolean) {
    }
}

export class Journal {
  constructor(
    public name: string,
    public issn: string[]) {
    }
}

export class JournalObj {
  constructor(
    public journal: Journal,
    public issue: number,
    public pages: string,
    public publisher: string,
    public volume: number) {
    }
}
