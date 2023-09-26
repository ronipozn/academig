import {Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';

import {AuthService} from '../../auth/auth.service';
import {UserService} from '../../user/services/user-service';

import {Publication, PublicationService} from '../../shared/services/publication-service';

import {itemsAnimation} from '../../shared/animations/index';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

import * as moment from 'moment';

@Component({
    selector: 'search-publications',
    templateUrl: 'search-publications.html',
    styleUrls: ['search-publications.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class SearchPublicationsComponent implements OnInit, OnDestroy {
  publications: Publication[] = [];
  streamRetrieved: boolean;

  streamPublications: number[] = [];
  streamPublicationsFolder: number[] = [];

  query: string;

  refineSelect: string;

  isAuthenticated: boolean;
  isMobile: boolean;

  searchFlag: boolean;

  color = 'primary';
  mode = 'indeterminate';

  private auth0Client: Auth0Client;

  constructor(public userService: UserService,
              private publicationService: PublicationService,
              private titleService: Title,
              private authService: AuthService,
              private datepipe: DatePipe) {
    this.titleService.setTitle('Search Publications | Academig');
    this.isMobile = (window.innerWidth < 768);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = (window.innerWidth < 768);
  }

  async ngOnInit() {
    this.streamRetrieved=false;
    this.authService.isAuthenticated.subscribe(value => this.isAuthenticated = value);
    this.auth0Client = await this.authService.getAuth0Client();
    this.streamRetrieved=true;
  }

  clearOp() {

  }

  async keyUpOp(query: string) {
    this.query = query;
    this.searchFlag = true;
    this.publications = []
    // if (term === '') return of([]); // return Observable.of([]);
    const raw =  await this.publicationService.queryPublications(query)
    this.publicationsFilters((Array.isArray(raw)) ? raw : [])
    this.searchFlag = false;
  }

  publicationsFilters(rawPublications: any[]) {
    rawPublications.forEach((rawPublication, index) => {
      this.publications.push(this.publicationFilter(rawPublication));
    })
    this.streamPublications = new Array(this.publications.length).fill(0);
    this.streamPublicationsFolder = new Array(this.publications.length).fill(0);
  }

  publicationFilter(query) {
    let publication: any = {
      "type": null
    };

    let type: number;
    switch (query.type) {
      case 'journal-article': { type = 0; break; }
      case 'posted-content': { type = 0; break; }
      case 'book': { type = 1; break; }
      case 'book-section': { type = 1; break; }
      case 'book-track': { type = 1; break; }
      case 'book-part': { type = 1; break; }
      case 'book-set': { type = 1; break; }
      case 'reference-book': { type = 1; break; }
      case 'book-series': { type = 1; break; }
      case 'edited-book': { type = 1; break; }
      case 'book-chapter': { type = 2; break; }
      case 'proceedings': { type = 3; break; }
      case 'proceedings-article': { type = 3; break; }
      case 'patent': { type = 4; break; } // FIX
      case 'report': { type = 5; break; }
      // default: { type = 6; } // Other
      default: { type = 0; } // Other // FIX
    }

    publication['type'] = type;
    publication['title'] = query['name']
    publication['referencesCount'] = query['references-count']
    publication['citationsCount'] = query['is-referenced-by-count']
    publication['authors'] = query.author;
    publication['DOI'] = query.DOI;
    publication['URL'] = query.URL;
    publication['publisher'] = query.publisher;
    publication['abstract'] = query.abstract;
    publication['abstractPic'] = query.abstractPic;
    // this.formModel.controls['tags'].setValue(query.subject ? query.subject : '');

    if ((type==0 || type==5)) publication['abbr'] = (query['short-container-title'] && query['short-container-title'][0]) ?  query['short-container-title'][0] : null;
    if ((type==0 || type==3 || type==5)) publication['journal'] = (query['container-title'] && query['container-title'][0]) ? {'name': query['container-title'][0]} : {'name': ''};

    if (type!=1 && type!=3) publication['volume'] = query.volume ? query.volume : '';
    if (type==0) publication['issue'] = query.issue ? query.issue : '';
    if (type==1 || type==2) publication['edition'] = query.edition ? query.edition : '';
    if (type!=5) publication['pages'] = query.page ? query.page : '';

    const date: number[] = query.issued['date-parts'][0];
    if (!date[2]) date[2] = 1; // FIX!!!! what to do when Day is not aviliable in the Date?
    if (!date[1]) date[1] = 1; // FIX!!!! what to do when Month is not aviliable in the Date?
    if (date[0]) {
      let dateWrapper = moment.utc([date[0], date[1]-1, date[2]]).format('YYYY-MM-DD');
      publication['date'] = dateWrapper;
    } else {
      publication['date'] = this.datepipe.transform('', 'YYYY-MM-DD');
    }

    return publication;
  }

  updateSearchInterests(tag: string) {
    this.refineSelect = tag;
  }

  // async itemFollow(i: number, mode: number, itemId: string) {
  // }

  async login() {
    await this.auth0Client.loginWithRedirect({
      redirect_uri: `${window.location.origin}/callback`,
      // appState: { target: this.router.url }
    });
  }

  ngOnDestroy() { }

}
