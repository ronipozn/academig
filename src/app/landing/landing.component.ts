import {Component, OnInit, Input, HostListener} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, NavigationEnd} from '@angular/router';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/services/user-service';
import { PeopleService } from '../shared/services/people-service';
import { MetaService } from '../shared/services/meta-service';
import { complexName } from '../shared/services/shared-service';

import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'TDKUK8VW4T',
  '73303e9badf36767a06c37395b6a3693'
);

import {environment} from '../../environments/environment';

@Component({
  selector: 'landing',
  templateUrl: 'landing.html',
  styleUrls: ['landing.css']
})
export class LandingComponent implements OnInit {
  isMobile: boolean;

  filterFlag: boolean[];

  searches: any[];

  config_labs = {
    indexName: environment.algolia.labs,
    searchClient,
  };

  private auth0Client: Auth0Client;

  constructor(public titleService: Title,
              public router: Router,
              public authService: AuthService,
              public peopleService: PeopleService,
              public userService: UserService,
              private metaService: MetaService) {
    this.titleService.setTitle('Academig - research labs search engine');
    this.metaService.addMetaTags('Academig', 'academia, resarch labs, phd, msc, post-doc, departments, universities', null);
    this.isMobile = (window.innerWidth < 577);
    this.filterFlag = new Array(5).fill(false);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = (window.innerWidth < 577);
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
    const searches = await this.peopleService.getFeatured();
    this.searches = searches.slice(0,2);
  }

  async login() {
    await this.auth0Client.loginWithRedirect({});
  }

  filterToggle(i: number) {
    const f: boolean = this.filterFlag[i];
    this.filterFlag = new Array(5).fill(false);
    this.filterFlag[i]=!f;
  }

  transformGroups = (groups) => {
    return groups
  }

}
