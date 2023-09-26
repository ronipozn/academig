import {Component} from '@angular/core';

import {AuthService} from '../../auth/auth.service';

import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'TDKUK8VW4T',
  '73303e9badf36767a06c37395b6a3693'
);

import {environment} from '../../../environments/environment';

@Component({
    selector: 'blog-view',
    templateUrl: 'blog-view.html',
    styleUrls: ['blog-view.css'],
})
export class BlogViewComponent {
  posts: any;

  // isAuthenticated: boolean;

  config_posts = {
    indexName: environment.algolia.posts,
    searchClient,
  };

  constructor(private authService: AuthService) {  }

  // async ngOnInit() {
  //   this.authService.isAuthenticated.subscribe(value => {
  //     this.isAuthenticated = value;
  //   });
  // }

}
